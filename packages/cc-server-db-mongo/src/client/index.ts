import { Db, ObjectID } from 'mongodb';
import { MongoDBConnection } from './connection';
import { provide } from 'cc-server-ioc'
import { DBClient } from 'cc-server-db'

@provide(DBClient)
export class MongoDBClient<T = any> implements DBClient {
    public db: Db;

    constructor() {
        MongoDBConnection.getConnection((connection) => {
            this.db = connection;
        });
    }

    public getProvide(): Db {
        return this.db;
    }

    public async find(collection: string, filter: object): Promise<T[]> {
        return await this.db.collection(collection).find(filter).toArray();
    }

    public async findOne(collection: string, filter: Object): Promise<T> {
        let result = await this.db.collection(collection).find(filter).limit(1).toArray();
        return result[0];
    }

    public async findOneById(collection: string, objectId: string): Promise<T> {
        return await this.findOne(collection, { _id: new ObjectID(objectId) })
    }

    public async insertOne(collection: string, model: T): Promise<T> {
        var insert = await this.db.collection(collection).insertOne(model);
        return insert.ops[0];
    }

    public async updateOne(collection: string, where: any, model: any): Promise<boolean> {
        let result = await this.db.collection(collection).updateOne(where, { $set: model });
        return result.result.ok == 1 && result.result.n > 0;
    }

    public async updateById(collection: string, objectId: string, model: any): Promise<boolean> {
        return await this.updateOne(collection, { _id: new ObjectID(objectId) }, { $set: model })
    }

    public async deleteOne(collection: string, where: any): Promise<boolean> {
        let result = await this.db.collection(collection).deleteOne(where);
        return result.result.ok === 1 && result.result.n > 0
    }

    public async deleteById(collection: string, objectId: string): Promise<boolean> {
        return this.deleteOne(collection, { _id: new ObjectID(objectId) });
    }
}
