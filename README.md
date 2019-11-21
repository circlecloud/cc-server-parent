# `cc-server`

> 一个简易的 IOC 注入 Web 开发框架 仿照 SpringBoot 使用 TypeScript 开发

## Usage

> 当前包尚未发布到 NPM 中央仓库
> 如需使用 请自行配制 repo `https://repo.yumc.pw/repository/npm/`

### Simple Example

```TypeScript
import { CcServerBoot, express } from './index'

import './function/http'; // => WebServer
import './function/websocket'; // => Socket.IO
import { DBClient } from '@cc-server/db';
import { MongoClient } from 'mongodb';
import { MongoCollection } from '@cc-server/db-mongo';

let boot = new CcServerBoot().static('public');
MongoClient.connect("mongodb://192.168.2.5:27017", { useNewUrlParser: true }, (error, client) => {
    if (error) {
        console.log(error)
    } else {
        boot.container.bind(DBClient).toConstantValue(new MongoCollection(client.db("faas").collection("users"))).whenTargetNamed("users")
        boot.build().listen();
    }
})
```

### WebServer

```TypeScript
import { DBClient } from '@cc-server/db'
import { inject, named } from '@cc-server/ioc';
import { Vaild, NotBlank, NotNull, controller, requestBody, get, post, requestParam } from '@cc-server/binding'
import '@cc-server/db-mongo'

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
    @named("users")
    private client: DBClient

    @get('/')
    public async list(): Promise<ExampleModel[]> {
        return this.client.find({});
    }

    @get('/:id')
    public async get(
        @requestParam('id') id: string
    ): Promise<ExampleModel> {
        return this.client.findOneById(id);
    }

    @post('/')
    public async create(
        @Vaild() @requestBody() model: ExampleModel
    ): Promise<ExampleModel> {
        return model;
    }

    @post('/:id')
    public async update(
        @requestParam('id') id: string,
        @Vaild() @requestBody() model: ExampleModel
    ): Promise<boolean> {
        return this.client.updateById(id, model);
    }
}
```

### Socket.IO

```TypeScript
import { lazyInjectNamed } from '@cc-server/ioc'
import { controller, httpPost, requestBody } from '@cc-server/binding';
import { namespace, listener, interfaces, BroadcastMessage, io, TYPE } from '@cc-server/ws'

@namespace('/', (socket: io.Socket, next: (err?: any) => void) => {
    console.log(socket.nsp.name, socket.id, 'before connection');
    next();
})
export class Namespace extends interfaces.Namespace {
    private cache: { [key: string]: string } = {};

    public async connection(socket: io.Socket) {
        console.log(this.nsp.name, socket.id, 'connection');
        this.defer(socket, socket => console.log(this.nsp.name, socket.id, 'defer', this))
        return `Welcome to Websocket Chat Room Now: ${Date.now()} Your ID: ${socket.id}! \r\n`;
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
            let result = new BroadcastMessage(this.cache[socket.id] + '\n')
            return delete this.cache[socket.id] && result;
        }
        return data;
    }
}

@controller('/websocket')
export class WebSocketController {
    @lazyInjectNamed(TYPE.Namespace, Namespace.name)
    private root: Namespace;

    @httpPost('/')
    public async create(
        @requestBody() model: Object
    ): Promise<Object> {
        this.root.nsp.send(JSON.stringify(model));
        return model;
    }
}
```
