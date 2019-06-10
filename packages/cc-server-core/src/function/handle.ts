import {
    controller, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { MongoDBClient } from 'cc-server-db-mongo'

@controller('/')
export class UserController {
    constructor(
        @inject(MongoDBClient) private MongoDBClient: MongoDBClient
    ) { }

    @httpGet('/')
    public async getUsers(): Promise<any[]> {
        return []
    }

    @httpPost('/')
    public async newUser(): Promise<any> {
        return {}
    }
}
