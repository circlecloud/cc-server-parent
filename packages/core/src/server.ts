import { CcServerBoot, express } from './index'

import './function/http';
import './function/websocket';

new CcServerBoot().static('public').build().start();
