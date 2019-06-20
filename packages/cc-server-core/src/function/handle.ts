import {
    controller, response, requestBody, httpGet, httpPost, queryParam, requestParam
} from 'inversify-express-utils';
import { inject, postConstruct } from 'inversify';
import { Vaild, NotBlank, NotNull } from 'cc-server-binding'
import { DBClient } from 'cc-server-db'
import 'cc-server-db-mongo'

//process.env.FAAS_MONGO_URL = 'mongodb://192.168.0.2:27017';
//process.env.FAAS_MONGO_DB = "faas";

const TABLE = 'users'

class ExampleModel {
    _id: string;
    @NotBlank("用户名不得为空!")
    username: string;
    password: string;
    @NotNull()
    age: number;
    email: string;
}

type Model = ExampleModel

@controller('')
export class Controller {
    @inject(DBClient)
    private client: DBClient

    @postConstruct()
    private init(): void {
        this.client.setTable(TABLE);
    }

    @httpGet('/')
    public async list(): Promise<Model[]> {
        return this.client.find({});
    }

    @httpGet('/:id')
    public async get(
        @requestParam('id') id: string
    ): Promise<Model> {
        return this.client.findOneById(id);
    }

    @httpPost('/')
    public async create(
        @Vaild() @requestBody() model: ExampleModel
    ): Promise<ExampleModel> {
        //return this.client.insertOne(model);
        return this.client.findOneById('5d0af7c039179a28de618cb8');
    }

    @httpPost('/:id')
    public async update(
        @requestParam('id') id: string,
        @requestBody() model: Model
    ): Promise<boolean> {
        return this.client.updateById(id, model);
    }
}
