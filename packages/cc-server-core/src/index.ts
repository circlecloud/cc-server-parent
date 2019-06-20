import 'reflect-metadata';
import * as express from "express";
import { InversifyExpressServer, interfaces, getRouteInfo } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import { rebuildServer } from 'cc-server-binding'
import { container, buildProviderModule } from 'cc-server-ioc';
import * as prettyjson from "prettyjson";

export class CcServerBoot {
    private server: InversifyExpressServer;
    private serverInstance: express.Application;
    constructor() {
        container.load(buildProviderModule());
        // start the server
        this.server = new InversifyExpressServer(container);
        this.server.setConfig((app) => {
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
            app.use(bodyParser.raw());
        });
    }

    public setConfig(fn: interfaces.ConfigFunction) {
        this.server.setConfig(fn)
    }

    public setErrorConfig(fn: interfaces.ConfigFunction) {
        this.server.setErrorConfig(fn)
    }

    public build() {
        this.serverInstance = this.server.build();
        rebuildServer(container);
        return this.serverInstance;
    }

    public start() {
        const routeInfo = getRouteInfo(container);
        console.log(prettyjson.render({ routes: routeInfo }));
        this.serverInstance.listen(80);
        console.log('Server started on port 80 :)');
    }
}
