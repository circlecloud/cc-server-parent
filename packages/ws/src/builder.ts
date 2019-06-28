import "reflect-metadata";
import { Container } from 'inversify'
import { interfaces, BroadcastMessage } from './interfaces'
import { TYPE } from './constants'
import { getNamespaces, getNamespaceMetadata, getNamespaceListenerMetadata } from './utils'
import * as io from 'socket.io'

export function buildWebSocket(container: Container, server: io.Server) {
    let constructors = getNamespaces();
    if (!constructors.length) { return; }

    registryNamespace(container, constructors);

    // get all namespaces
    let namespaces = container.getAll<interfaces.Namespace>(TYPE.Namespace)
    for (const namespace of namespaces) {
        let namespaceMetadata = getNamespaceMetadata(namespace);
        let namespaceEventMetadata = getNamespaceListenerMetadata(namespace);
        let ns = server.of(namespaceMetadata.name);
        namespace.constructor.prototype.nsp = ns;
        applyNamespaceMiddleware(namespaceMetadata, ns);
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
    // socket.use((packet: io.Packet, next: (err?: any) => void) => {
    //     Reflect.defineMetadata(TYPE.SocketContext, socket, packet);
    //     next();
    // })
    let middlewares = [...new Set(flatten(namespaceEventMetadata.map((data) => data.middleware)))];
    for (const middleware of middlewares) {
        socket.use((packet: io.Packet, next: (err?: any) => void) => { middleware(socket, packet, next); });
    }
}

async function applyEvent(namespaceInstance: interfaces.Namespace, socket: io.Socket) {
    if (namespaceInstance.connection) {
        let result = await namespaceInstance.connection(socket);
        if (result != undefined) {
            socket.send(result);
        }
    }
    if (namespaceInstance.disconnect) {
        socket.on('disconnect', async () => await namespaceInstance.disconnect(socket));
    }
}

function applyListeners(namespaceEventMetadata: interfaces.ListenerMetadata[], socket: io.Socket, namespaceInstance: interfaces.Namespace) {
    for (const event of namespaceEventMetadata) {
        socket.on(event.name, async data => {
            let result = await namespaceInstance[event.key](socket, data);
            if (result != undefined) {
                if (result instanceof BroadcastMessage) {
                    socket.broadcast.emit(event.name, result.message);
                }
                else {
                    socket.emit(event.name, result);
                }
            }
        });
    }
}