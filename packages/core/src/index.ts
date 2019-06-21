import 'reflect-metadata';
import * as express from "express";
import { InversifyExpressServer, interfaces, getRouteInfo } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import { buildProviderModule } from '@cc-server/ioc';
import { rebuildServer } from '@cc-server/binding'
import * as prettyjson from "prettyjson";
import { Container } from 'inversify';

export class CcServerBoot {
    private _container: Container;
    private _server: InversifyExpressServer;
    private _serverInstance: express.Application;
    constructor(container?: Container) {
        this._container = container || new Container();
        this._container.load(buildProviderModule());
        // start the server
        this._server = new InversifyExpressServer(this._container);
        this._server.setConfig((app) => {
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
            app.use(bodyParser.raw());
        });
    }

    public setConfig(fn: interfaces.ConfigFunction) {
        this._server.setConfig(fn)
    }

    public setErrorConfig(fn: interfaces.ConfigFunction) {
        this._server.setErrorConfig(fn)
    }

    public build() {
        this._serverInstance = this._server.build();
        rebuildServer(this._container);
        return this._serverInstance;
    }

    public start(port: number = 80) {
        const routeInfo = getRouteInfo(this._container);
        console.log(prettyjson.render({ routes: routeInfo }));
        this._serverInstance.listen(port);
        console.log(`Server started on port ${port} :)`);
    }
}
