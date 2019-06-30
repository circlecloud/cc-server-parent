import "reflect-metadata";
import * as io from 'socket.io'
import { Container } from 'inversify'
import { TYPE, METADATA_KEY } from './constants'
import { interfaces, Message, BroadcastMessage, EventMessage } from './interfaces'
import { getNamespaces, getNamespaceMetadata, getNamespaceListenerMetadata, getSocketDeferMetadata } from './utils'

export function buildWebSocket(container: Container, server: io.Server) {
    let constructors = getNamespaces();
    if (!constructors.length) { return; }

    registryNamespace(container, constructors);

    // get all namespaces
    let namespaces = container.getAll<interfaces.Namespace>(TYPE.Namespace);
    for (const namespace of namespaces) {
        let namespaceMetadata = getNamespaceMetadata(namespace);
        let namespaceEventMetadata = getNamespaceListenerMetadata(namespace);
        let ns = initNamespace(server, namespaceMetadata, namespace);
        ns.on('connection', async (socket: io.Socket) => {
            let namespaceInstance = container.getNamed<interfaces.Namespace>(TYPE.Namespace, namespace.constructor.name);
            await applyEvent(namespaceInstance, socket);
            await applyMiddlewares(namespaceEventMetadata, socket);
            await applyListeners(namespaceEventMetadata, socket, namespaceInstance);
        })
    }
}

function registryNamespace(container: Container, constructors: any[]) {
    constructors.forEach((constructor) => {
        const name = constructor.name;
        if (container.isBoundNamed(TYPE.Namespace, name)) {
            throw new Error(`DUPLICATED_NAMESPACE(${name})`);
        }
        container.bind(TYPE.Namespace)
            .to(constructor)
            .whenTargetNamed(name);
    });
}

function initNamespace(server: io.Server, namespaceMetadata: interfaces.NamespaceMetadata, namespace: interfaces.Namespace) {
    let ns = server.of(namespaceMetadata.name);
    namespace.constructor.prototype.nsp = ns;
    applyNamespaceMiddleware(namespaceMetadata, ns);
    return ns;
}

function applyNamespaceMiddleware(namespaceMetadata: interfaces.NamespaceMetadata, ns: io.Namespace) {
    for (const middleware of namespaceMetadata.middleware) {
        ns.use(middleware);
    }
}

function flatten(arr: Array<any>) {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr);
    }
    return arr;
}

function applyMiddlewares(namespaceEventMetadata: interfaces.ListenerMetadata[], socket: io.Socket) {
    // flatten all event middleware and apply
    let middlewares = [...new Set(flatten(namespaceEventMetadata.map((data) => data.middleware)))];
    for (const middleware of middlewares) {
        socket.use((packet: io.Packet, next: (err?: any) => void) => { middleware(socket, packet, next); });
    }
}

async function applyEvent(namespaceInstance: interfaces.Namespace, socket: io.Socket) {
    // init socket defer array
    Reflect.defineMetadata(METADATA_KEY.defer, [], socket);
    // apply connection event
    if (namespaceInstance.connection) {
        let result = await namespaceInstance.connection(socket);
        if (result != undefined) {
            socket.send(result);
        }
    }
    // apply disconnect event
    socket.on('disconnect', async () => {
        // exec defer function
        getSocketDeferMetadata(socket).forEach(defer => defer(socket));
        if (namespaceInstance.disconnect) {
            await namespaceInstance.disconnect(socket);
        }
    });
}

function applyListeners(namespaceEventMetadata: interfaces.ListenerMetadata[], socket: io.Socket, namespaceInstance: interfaces.Namespace) {
    for (const event of namespaceEventMetadata) {
        socket.on(event.name, async data => {
            let result = await namespaceInstance[event.key](socket, data);
            if (result != undefined) {
                if (result instanceof BroadcastMessage) {
                    socket.broadcast.emit(result.event || event.name, result.message);
                } else if (result instanceof EventMessage) {
                    socket.emit(result.event || event.name, result.message);
                } else if (result instanceof Message) {
                    socket.emit(result.event || 'message', result.message);
                } else {
                    socket.emit(event.name, result);
                }
            }
        });
    }
}
