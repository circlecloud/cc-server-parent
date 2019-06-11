export const DBClient = Symbol.for('DBClient')
export interface DBClient<T = any> {
    getProvide(): any;
    find(collection: string, filter: object): Promise<T[]>;
    findOne(collection: string, filter: Object): Promise<T>;
    findOneById(collection: string, objectId: string): Promise<T>;
    insertOne(collection: string, model: T): Promise<T>;
    updateOne(collection: string, where: any, model: any): Promise<boolean>;
    updateById(collection: string, objectId: string, model: any): Promise<boolean>;
    deleteOne(collection: string, where: any): Promise<boolean>;
    deleteById(collection: string, objectId: string): Promise<boolean>;
}