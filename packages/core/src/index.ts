import 'reflect-metadata';
import * as http from 'http'
import * as express from "express";
import * as prettyjson from "prettyjson";
import * as bodyParser from 'body-parser';
import { buildWebSocket, io } from '@cc-server/ws'
import { buildProviderModule, Container } from '@cc-server/ioc';
import { InversifyExpressServer, interfaces, getRouteInfo, rebuildServer } from '@cc-server/binding'

export { io, http, express }

export class CcServerBoot {
    private _container: Container;
    private _server: http.Server;
    private _serverInstance: express.Application;
    private _serverInversify: InversifyExpressServer;
    private _wsServer: io.Server;

    constructor(container?: Container) {
        this._container = container || new Container();
        this._serverInstance = express();
        this._server = http.createServer(this._serverInstance);
        // start the server
        this._serverInversify = new InversifyExpressServer(this._container, null, null, this._serverInstance);
        this._serverInversify.setConfig((app) => {
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
            app.use(bodyParser.raw());
        });
        this._wsServer = io(this._server, {
            path: '/ws',
            serveClient: false,
        })
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
        return this._wsServer;
    }

    public setConfig(fn: interfaces.ConfigFunction) {
        this._serverInversify.setConfig(fn)
    }

    public setErrorConfig(fn: interfaces.ConfigFunction) {
        this._serverInversify.setErrorConfig(fn)
    }

    public build() {
        this._container.load(buildProviderModule());
        this._serverInstance = this._serverInversify.build();
        rebuildServer(this._container);
        buildWebSocket(this._container, this._wsServer);
        return this._serverInstance;
    }

    public start(port: number = 80) {
        const routeInfo = getRouteInfo(this._container);
        console.log(prettyjson.render({ routes: routeInfo }));
        this._server.listen(port);
        console.log(`Server started on port ${port} :)`);
    }
}
