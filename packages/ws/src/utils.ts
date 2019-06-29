import { interfaces } from './interfaces'
import { METADATA_KEY } from './constants'

function getNamespaces() {
    return getNamespacesMetadata().map((target) => target.target);
}

function getNamespacesMetadata() {
    let namespaceMetadata: interfaces.NamespaceMetadata[] = Reflect.getMetadata(
        METADATA_KEY.namespace,
        Reflect
    ) || [];
    return namespaceMetadata;
}

function getNamespaceMetadata(target: any) {
    let namespaceMetadata: interfaces.NamespaceMetadata = Reflect.getMetadata(
        METADATA_KEY.namespace,
        target.constructor
    ) || {};
    return namespaceMetadata;
}

function getNamespaceListenerMetadata(target: any) {
    let eventMetadata: interfaces.ListenerMetadata[] = Reflect.getMetadata(
        METADATA_KEY.listener,
        target.constructor
    ) || [];
    return eventMetadata;
}

export {
    getNamespaces,
    getNamespaceMetadata,
    getNamespacesMetadata,
    getNamespaceListenerMetadata
}
