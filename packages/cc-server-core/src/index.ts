import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import { container, buildProviderModule } from 'cc-server-ioc';

import './function/handle';

container.load(buildProviderModule());

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
