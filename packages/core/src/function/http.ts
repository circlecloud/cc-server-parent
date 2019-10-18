import { DBClient } from '@cc-server/db'
import { inject, named } from '@cc-server/ioc';
import { Vaild, NotBlank, NotNull, controller, requestBody, get, post, requestParam } from '@cc-server/binding'
import '@cc-server/db-mongo'

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
    @named("users")
    private client: DBClient

    @get('/')
    public async list(): Promise<ExampleModel[]> {
        return this.client.find({});
    }

    @get('/:id')
    public async get(
        @requestParam('id') id: string
    ): Promise<ExampleModel> {
        return this.client.findOneById(id);
    }

    @post('/')
    public async create(
        @Vaild() @requestBody() model: ExampleModel
    ): Promise<ExampleModel> {
        return model;
    }

    @post('/:id')
    public async update(
        @requestParam('id') id: string,
        @Vaild() @requestBody() model: ExampleModel
    ): Promise<boolean> {
        return this.client.updateById(id, model);
    }
}
