import {
    controller, httpGet, httpPost
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { DBClient } from 'cc-server-db'
import 'cc-server-db-mongo'

@controller('/')
export class UserController {
    constructor(
        @inject(DBClient) private client: DBClient
    ) { }

    @httpGet('/')
    public async getUsers(): Promise<any[]> {
        return this.client.find('users', {});
    }

    @httpPost('/')
    public async newUser(): Promise<any> {
        return {}
    }
}
