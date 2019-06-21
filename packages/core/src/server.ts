import { CcServerBoot } from './index'

import './function/handle';

let server = new CcServerBoot();

server.build();
server.start();
