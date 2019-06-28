import { CcServerBoot, express } from './index'

import './function/http';
import './function/websocket';

let server = new CcServerBoot();

server.express.use(express.static('public'));

server.build();
server.start();
