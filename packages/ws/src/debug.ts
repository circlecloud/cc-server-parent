import { TYPE } from './constants'
import { interfaces } from './interfaces'
import { getContainer } from '@cc-server/ioc'
import { getNamespaceMetadata, getNamespaceListenerMetadata } from './utils'

export function getNamespaceInfo() {
    if (!getContainer().isBound(TYPE.Namespace)) { return [] };
    let namespaces = getContainer().getAll<interfaces.Namespace>(TYPE.Namespace)
    return namespaces.map(namespace => {
        let namespaceMetadata = getNamespaceMetadata(namespace);
        let listenerMetadata = getNamespaceListenerMetadata(namespace);
        return {
            namespace: namespaceMetadata.name,
            listeners: listenerMetadata.map(listener => {
                return {
                    event: listener.name,
                    method: listener.key,
                }
            })
        }
    })
}
