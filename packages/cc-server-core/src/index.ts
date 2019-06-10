import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import * as bodyParser from 'body-parser';
import './function/handle';
import { METADATA_KEY } from 'cc-server-ioc';

// load everything needed to the Container
let container = new Container();
Reflect.defineMetadata(METADATA_KEY.container, container, Reflect)

// auto load service
let services: Function[] = Reflect.getMetadata(METADATA_KEY.service, Reflect);
for (const service of services) {
    service()
}

// start the server
let server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.raw())
});

let serverInstance = server.build();
serverInstance.listen(80);

console.log('Server started on port 80 :)');
