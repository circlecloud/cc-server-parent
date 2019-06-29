import { TYPE, io } from '@cc-server/ws'
import { DBClient } from '@cc-server/db'
import { inject, postConstruct } from '@cc-server/ioc';
import { Vaild, NotBlank, NotNull, controller, requestBody, httpGet, httpPost, requestParam } from '@cc-server/binding'
import '@cc-server/db-mongo'

//process.env.FAAS_MONGO_URL = 'mongodb://192.168.0.2:27017';
//process.env.FAAS_MONGO_DB = "faas";

const TABLE = 'users'

class ExampleModel {
    _id: string;
    @NotBlank("username must not be blank!")
    username: string;
    password: string;
    @NotNull()
    age: number;
    email: string;
}

@controller('/example')
export class Controller {
    @inject(DBClient)
    private client: DBClient

    @postConstruct()
    private init(): void {
        this.client.setTable(TABLE);
    }

    @httpGet('/')
    public async list(): Promise<ExampleModel[]> {
        return this.client.find({});
    }

    @httpGet('/:id')
    public async get(
        @requestParam('id') id: string
    ): Promise<ExampleModel> {
        return this.client.findOneById(id);
    }

    @httpPost('/')
    public async create(
        @Vaild() @requestBody() model: ExampleModel
    ): Promise<ExampleModel> {
        return model;
        //return this.client.insertOne(model);
    }

    @httpPost('/:id')
    public async update(
        @requestParam('id') id: string,
        @requestBody() model: ExampleModel
    ): Promise<boolean> {
        return this.client.updateById(id, model);
    }
}
