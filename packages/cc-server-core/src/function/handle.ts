import {
    controller, response, requestBody, httpGet, httpPost, queryParam
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { DBClient } from 'cc-server-db'
import 'cc-server-db-mongo'

//process.env.FAAS_MONGO_URL = 'mongodb://192.168.0.2:27017';
process.env.FAAS_MONGO_DB = "faas";

const TABLE = 'users'

interface ExampleModel {
    _id: string;
    username: string;
    password: string;
    age: number;
    email: string;
}

type Model = ExampleModel

@controller('/')
export class Controller {
    @inject(DBClient)
    private client: DBClient

    @httpGet('/')
    public async list(): Promise<Model[]> {
        return this.client.find(TABLE, {});
    }

    @httpGet('/:id')
    public async get(
        @queryParam('id') id: string
    ): Promise<Model> {
        return this.client.findOneById(TABLE, id);
    }

    @httpPost('/')
    public async create(
        @requestBody() model: Model
    ): Promise<Model> {
        return this.client.insertOne(TABLE, model);
    }

    @httpPost('/:id')
    public async update(
        @queryParam('id') id: string,
        @requestBody() model: Model
    ): Promise<boolean> {
        return this.client.updateById(TABLE, id, model);
    }
}
