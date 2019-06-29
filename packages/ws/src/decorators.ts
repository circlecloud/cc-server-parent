import { interfaces } from './interfaces'
import { METADATA_KEY } from './constants'
import { injectable, decorate } from "inversify";
import { getNamespaceListenerMetadata, getNamespacesMetadata } from './utils'

/**
 * Socket.io Namespace
 * @param name namespace name default is '/'
 * @param middleware middleware array
 */
export function namespace(name?: string, ...middleware: interfaces.Middleware[]) {
    return function(target: any) {
        let currentMetadata: interfaces.NamespaceMetadata = {
            name: name || '/',
            middleware: middleware,
            target: target
        };
        decorate(injectable(), target);
        Reflect.defineMetadata(METADATA_KEY.namespace, currentMetadata, target);
        const previousMetadata: interfaces.NamespaceMetadata[] = getNamespacesMetadata();
        Reflect.defineMetadata(METADATA_KEY.namespace, [currentMetadata, ...previousMetadata], Reflect);
    };
}

/**
 * Socket.io listner
 * @param name event name
 */
export function listener(name?: string, ...middleware: interfaces.ListenerMiddleware[]) {
    return function(target: any, key: string, value: any) {
        let currentMetadata: interfaces.ListenerMetadata = {
            name: name || key,
            middleware: middleware,
            key: key,
            target: target
        };
        const previousMetadata: interfaces.ListenerMetadata[] = getNamespaceListenerMetadata(target)
        Reflect.defineMetadata(METADATA_KEY.listener, [currentMetadata, ...previousMetadata], target.constructor);
    };
}
