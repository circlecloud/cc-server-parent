import { inject, postConstruct } from '@cc-server/ioc';
import { Vaild, NotBlank, NotNull, controller, requestBody, httpGet, httpPost, requestParam } from '@cc-server/binding'
import { namespace, listener, interfaces, io, getSocketContext } from '@cc-server/ws'
import { DBClient } from '@cc-server/db'
import '@cc-server/db-mongo'

//process.env.FAAS_MONGO_URL = 'mongodb://192.168.0.2:27017';
//process.env.FAAS_MONGO_DB = "faas";

const TABLE = 'users'

class ExampleModel {
    _id: string;
    @NotBlank("username must not be blank!")
    username: string;
    password: string;
    @NotNull()
    age: number;
    email: string;
}

@controller('/example')
export class Controller {
    @inject(DBClient)
    private client: DBClient

    @postConstruct()
    private init(): void {
        this.client.setTable(TABLE);
    }

    @httpGet('/')
    public async list(): Promise<ExampleModel[]> {
        return this.client.find({});
    }

    @httpGet('/:id')
    public async get(
        @requestParam('id') id: string
    ): Promise<ExampleModel> {
        return this.client.findOneById(id);
    }

    @httpPost('/')
    public async create(
        @Vaild() @requestBody() model: ExampleModel
    ): Promise<ExampleModel> {
        return model;
        //return this.client.insertOne(model);
    }

    @httpPost('/:id')
    public async update(
        @requestParam('id') id: string,
        @requestBody() model: ExampleModel
    ): Promise<boolean> {
        return this.client.updateById(id, model);
    }
}

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
