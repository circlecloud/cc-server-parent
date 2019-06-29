import { getNamespacesMetadata, getNamespaceMetadata, getNamespaceListenerMetadata } from './utils'

export function getNamespaceInfo() {
    let namespaces = getNamespacesMetadata();
    console.log(namespaces)
    return namespaces.map(namespace => {
        let listenerMetadata = getNamespaceListenerMetadata(namespace.target);
        console.log(namespace, listenerMetadata)
        return {
            namespace: namespace.name,
            listeners: listenerMetadata.map(listener => {
                return {
                    event: listener.name,
                    method: listener.key,
                }
            })
        }
    })
}