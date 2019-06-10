import { Db, ObjectID, UpdateWriteOpResult } from 'mongodb';
import { injectable } from 'inversify';
import { MongoDBConnection } from './connection';
import { service } from 'cc-server-ioc'

interface DBClient<T = any> {
    find(table: string, where: object): T
}

export const NAME: string = 'MongoDBClient'

@service()
@injectable()
export class MongoDBClient<T = any> implements DBClient {
    public db: Db;

    constructor() {
        MongoDBConnection.getConnection((connection) => {
            this.db = connection;
        });
    }

    public find(collection: string, filter: object): Promise<T[]> {
        return this.db.collection(collection).find(filter).toArray();
    }

    public async findOne(collection: string, filter: Object): Promise<T> {
        let result = await this.db.collection(collection).find(filter).limit(1).toArray();
        return result[0];
    }

    public async findOneById(collection: string, objectId: string): Promise<T> {
        return this.findOne(collection, { _id: new ObjectID(objectId) })
    }

    public async insertOne(collection: string, model: T): Promise<T> {
        var insert = await this.db.collection(collection).insertOne(model);
        return insert.ops[0];
    }

    public updateOne(collection: string, where: any, model: any): Promise<UpdateWriteOpResult> {
        return this.db.collection(collection).updateOne(where, { $set: model });
    }

    public updateById(collection: string, objectId: string, model: any): Promise<UpdateWriteOpResult> {
        return this.updateOne(collection, { _id: new ObjectID(objectId) }, { $set: model })
    }

    public async deleteOne(collection: string, where: any): Promise<boolean> {
        let result = await this.db.collection(collection).deleteOne(where);
        return result.result.ok === 1 && result.result.n > 0
    }

    public async deleteById(collection: string, objectId: string): Promise<boolean> {
        return this.deleteOne(collection, { _id: new ObjectID(objectId) });
    }
}
