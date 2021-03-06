import "reflect-metadata";
import { interfaces } from 'inversify';
import { fluentProvide } from 'inversify-binding-decorators';

const provideNamed = (identifier: interfaces.ServiceIdentifier<any>, name: string) => {
    return fluentProvide(identifier).whenTargetNamed(name).done();
};

const provideSingleton = (identifier: interfaces.ServiceIdentifier<any>) => {
    return fluentProvide(identifier).inSingletonScope().done();
};

export * from 'inversify'
export * from './decorators'
export * from 'inversify-binding-decorators'
export {
    fluentProvide,
    provideNamed,
    provideSingleton
};
