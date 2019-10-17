import 'reflect-metadata';
import * as fs from 'fs';
import * as http from 'http';
import * as globby from "globby";
import * as express from "express";
import * as prettyjson from "prettyjson";
import * as bodyParser from 'body-parser';
import { buildWebSocket, io, getNamespaceInfo } from '@cc-server/ws'
import { buildProviderModule, Container, initContainer, getContainer } from '@cc-server/ioc';
import { InversifyExpressServer, getRouteInfo, rebuildServer, controller, httpGet } from '@cc-server/binding';

export { http, express }

@controller('/actuator')
class Actuator {
    @httpGet('/mappings')
    private mappings() {
        return {
            http: getRouteInfo(getContainer()),
            websocket: getNamespaceInfo()
        };
    }
}

export class CcServerBoot {
    private _container: Container;
    private _server: http.Server;
    private _serverInstance: express.Application;
    private _serverInversify: InversifyExpressServer;
    private _serverWebsocket: io.Server;
    private _beforeUse: express.RequestHandler[] = [];
    private _afterUse: express.ErrorRequestHandler[] = [];

    constructor(container?: Container) {
        this._container = container || this.$createContainer();
        this._serverInstance = this.$createExpressServer();
        this._server = this.$createServer();
        this._serverInversify = this.$createInversifyServer();
        this._serverWebsocket = this.$createWebsocketServer();
        initContainer(this._container);
    }

    protected $createContainer(): Container {
        return new Container();
    }

    protected $createServer(): http.Server {
        return http.createServer(this._serverInstance);
    }

    protected $createExpressServer(): express.Application {
        return express();
    }

    protected $createInversifyServer(): InversifyExpressServer {
        return new InversifyExpressServer(this._container, null, null, this._serverInstance);
    }

    protected $createWebsocketServer(): io.Server {
        return io(this._server, {
            path: '/ws',
            serveClient: false,
        });
    }

    protected use(middleware: express.RequestHandler) {
        this._beforeUse.push(middleware)
        return this;
    }

    protected error(middleware: express.ErrorRequestHandler) {
        this._afterUse.push(middleware)
        return this;
    }

    protected $onMountingMiddlewares() {
        this.use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .use(bodyParser.raw());
    }

    get server() {
        return this._server;
    }

    get express() {
        return this._serverInstance;
    }

    get inversify() {
        return this._serverInversify;
    }

    get websocket() {
        return this._serverWebsocket;
    }

    public static(root: string = 'public') {
        this.express.use(express.static(root));
        return this;
    }

    public scan(path: fs.PathLike) {
        let files = fs.readdirSync(path);
        for (const file of files) {

        }
    }

    public build() {
        this.$onMountingMiddlewares();
        this._serverInversify.setConfig((app) => {
            this._beforeUse.every(m => app.use(m))
        })
        this._serverInversify.setErrorConfig((app) => {
            this._afterUse.every(m => app.use(m))
        })
        this._container.load(buildProviderModule());
        this._serverInstance = this._serverInversify.build();
        rebuildServer(this._container);
        buildWebSocket(this._container, this._serverWebsocket);
        return this;
    }

    public start() {
        console.log(prettyjson.render({ routes: { http: getRouteInfo(this._container), websocket: getNamespaceInfo() } }));
        return this;
    }

    public listen(port: number = 80) {
        this._server.listen(port);
        console.log(`Server listen on port ${port} :)`);
    }
}
