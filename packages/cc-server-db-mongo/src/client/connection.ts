import { Db, MongoClient } from 'mongodb';

const connStr = process.env.FAAS_MONGO_URL || 'mongodb://192.168.0.2:27017';
const dbName = process.env.FAAS_MONGO_DB || "faas";

export class MongoDBConnection {
    private static isConnected: boolean = false;
    private static db: Db;

    public static getConnection(result: (connection) => void) {
        if (this.isConnected) {
            return result(this.db);
        } else {
            this.connect((error, db: Db) => {
                return result(this.db);
            });
        }
    }

    private static connect(result: (error, db: Db) => void) {
        MongoClient.connect(connStr, { useNewUrlParser: true }, (err, client) => {
            this.db = client.db(dbName);
            this.isConnected = true;
            return result(err, this.db);
        });
    }
}
