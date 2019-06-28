import { CcServerBoot, express } from './index'

import './function/handle';

let server = new CcServerBoot();

server.express.use(express.static('public'));

server.build();
server.start();
