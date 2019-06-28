import * as io from 'socket.io'
import { injectable } from 'inversify';

export class Message {
    constructor(public message: any) { }
}
export class BroadcastMessage {
    constructor(public message: any) { }
}

export namespace interfaces {
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
         * broadcast message on this namespace
         */
        public broadcast(message: any): BroadcastMessage {
            return new BroadcastMessage(message);
        }
        /**
         * Event Listener
         * @param data event data
         * @return return data will send use socket.emit(key, data)
         */
        [key: string]: ((data: any, socket: io.Socket) => any) | any;
    }

    export interface Middleware {
        (socket: io.Socket, next: (err?: any) => void): void;
    }
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
