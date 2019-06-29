import { Db, MongoClient } from 'mongodb';

const connStr = process.env.FAAS_MONGO_URL || 'mongodb://192.168.0.2:27017';
const dbName = process.env.FAAS_MONGO_DB || "faas";

export class MongoDBConnection {
    private static db: Db;

    public static async getConnection(): Promise<Db> {
        if (!this.db) { this.db = await this.connect() }
        return this.db;
    }

    private static async connect(): Promise<Db> {
        let client = await MongoClient.connect(connStr, { useNewUrlParser: true });
        return client.db(dbName);
    }
}
