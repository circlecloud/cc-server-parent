import { Db, ObjectID, Collection } from 'mongodb';
import { MongoDBConnection } from './connection';
import { provide } from 'cc-server-ioc'
import { DBClient } from 'cc-server-db'

@provide(DBClient)
export class MongoDBClient<T = any> implements DBClient {
    private table: string;
    private db: Db;
    private collection: Collection<T>;

    constructor() {
        MongoDBConnection.getConnection((connection) => {
            this.db = connection;
            if (this.table) {
                this.collection = this.db.collection(this.table);
            }
        });
    }

    public getProvide<P>(): P {
        return this.db as {} as P;
    }

    public setTable(table: string): void {
        this.table = table;
        if (this.db) {
            this.collection = this.db.collection(table);
        }
    }

    public async find(filter: object): Promise<T[]> {
        return await this.collection.find(filter).toArray();
    }

    public async findOne(filter: Object): Promise<T> {
        let result = await this.collection.find(filter).limit(1).toArray();
        return result[0];
    }

    public async findOneById(objectId: string): Promise<T> {
        return await this.findOne({ _id: new ObjectID(objectId) })
    }

    public async insertOne(model: T): Promise<T> {
        var insert = await this.collection.insertOne(model);
        return insert.ops[0];
    }

    public async updateOne(where: any, model: any): Promise<boolean> {
        let result = await this.collection.updateOne(where, { $set: model });
        return result.result.ok == 1 && result.result.n > 0;
    }

    public async updateById(objectId: string, model: any): Promise<boolean> {
        return await this.updateOne({ _id: new ObjectID(objectId) }, { $set: model })
    }

    public async deleteOne(where: any): Promise<boolean> {
        let result = await this.collection.deleteOne(where);
        return result.result.ok === 1 && result.result.n > 0
    }

    public async deleteById(objectId: string): Promise<boolean> {
        return this.deleteOne({ _id: new ObjectID(objectId) });
    }
}
