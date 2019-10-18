export const DBClient = Symbol.for('DBClient')
export interface DBClient<T = any> {
    getProvide<P>(): P;
    find(filter: object): Promise<T[]>;
    findOne(filter: Object): Promise<T>;
    findOneById(objectId: string): Promise<T>;
    insertOne(model: T): Promise<T>;
    updateOne(where: any, model: any): Promise<boolean>;
    updateById(objectId: string, model: any): Promise<boolean>;
    deleteOne(where: any): Promise<boolean>;
    deleteById(objectId: string): Promise<boolean>;
}