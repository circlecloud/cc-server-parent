import { DBClient } from '@cc-server/db'
import { ObjectID, Collection } from 'mongodb'

export class MongoCollection<T = any> implements DBClient {
    private collection: Collection<T>;

    constructor(collection: Collection<T>) {
        this.collection = collection;
    }

    public getProvide<P>(): P {
        return this.collection as {} as P;
    }

    public async find(filter: object): Promise<T[]> {
        return await this.collection.find(filter).toArray();
    }

    public async findOne(filter: object): Promise<T> {
        let result = await this.collection.find(filter).limit(1).toArray();
        return result[0];
    }

    public async findOneById(objectId: string): Promise<T> {
        return await this.findOne({ _id: new ObjectID(objectId) })
    }

    public async insertOne(model: T): Promise<T> {
        //@ts-ignore
        var insert = await this.collection.insertOne(model);
        return insert.ops[0];
    }

    public async updateOne(where: any, model: T): Promise<boolean> {
        let result = await this.collection.updateOne(where, { $set: model });
        return result.result.ok == 1 && result.result.n > 0;
    }

    public async updateById(objectId: string, model: T): Promise<boolean> {
        return await this.updateOne({ _id: new ObjectID(objectId) }, model)
    }

    public async deleteOne(where: object): Promise<boolean> {
        let result = await this.collection.deleteOne(where);
        return result.result.ok === 1 && result.result.n > 0
    }

    public async deleteById(objectId: string): Promise<boolean> {
        return this.deleteOne({ _id: new ObjectID(objectId) });
    }
}
