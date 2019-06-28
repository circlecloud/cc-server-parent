import { namespace, listener, interfaces, io } from '@cc-server/ws'

@namespace('/', (socket: io.Socket, next: (err?: any) => void) => {
    console.log(socket.nsp.name, socket.id, 'before connection');
    next();
})
export class Namespace extends interfaces.Namespace {
    private cache: { [key: string]: string } = {};

    public async connection(socket: io.Socket) {
        console.log(this.nsp.name, socket.id, 'connection');
        return `Welcome to Websocket Chat Room Now: ${Date.now()} Your ID: ${socket.id}! \n`;
    }

    public async disconnect(socket: io.Socket) {
        console.log(this.nsp.name, socket.id, 'disconnect');
    }

    @listener('message', (socket: io.Socket, packet: io.Packet, next: (err?: any) => void) => {
        console.log(socket.nsp.name, socket.id, 'listener middleware', [...packet]);
        next();
    })
    public async message(socket: io.Socket, data: any) {
        console.log(this.nsp.name, socket.id, 'message', data)
        this.cache[socket.id] = (this.cache[socket.id] || '') + data;
        if (data == '\r' && this.cache[socket.id] !== "") {
            let result = this.broadcast(this.cache[socket.id] + '\n')
            this.cache[socket.id] = '';
            return result;
        }
        return data;
    }
}
