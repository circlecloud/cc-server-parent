import * as io from 'socket.io'
import { injectable } from 'inversify';
import { getSocketDeferMetadata } from './utils'

export class Message {
    constructor(public message: any, public event?: string) { }
}
export class EventMessage extends Message {
}
export class BroadcastMessage extends Message {
}

export namespace interfaces {
    export type SocketEvent = ((socket: io.Socket) => void);

    @injectable()
    export class Namespace {
        /**
        * @see io.Namespace
        */
        public nsp?: io.Namespace;
        /**
         * The event fired when we get a new connection
         * @param socket socket
         * @return return data will send use socket.send(data)
         */
        public connection?(socket: io.Socket): any;
        /**
         * The event fired when socket is close
         * @param socket socket
         */
        public disconnect?(socket: io.Socket): void;
        /**
         * add disconnect defer function
         */
        protected defer?(socket: io.Socket, fn: SocketEvent) {
            getSocketDeferMetadata(socket).unshift(fn);
        }
        /**
         * Event Listener
         * @param data event data
         * @return return data will send use socket.emit(key, data)
         */
        [key: string]: ((socket: io.Socket, data: any) => any) | any;
    }

    /**
     * Namespace Middleware
     */
    export interface Middleware {
        (socket: io.Socket, next: (err?: any) => void): void;
    }
    /**
     * Listener Middleware
     */
    export interface ListenerMiddleware {
        (socket: io.Socket, packet: io.Packet, next: (err?: any) => void): void;
    }

    export interface NamespaceMetadata {
        name: string;
        middleware?: Middleware[];
        target: any;
    }
    export interface ListenerMetadata {
        name: string;
        key: string;
        /**
         * Socket Listener Middleware will share all event listener
         */
        middleware?: ListenerMiddleware[];
        target: any;
    }
}
