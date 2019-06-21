import "reflect-metadata";
import { Container, inject, interfaces } from 'inversify';
import { autoProvide, provide, fluentProvide, buildProviderModule } from 'inversify-binding-decorators';

const provideNamed = (identifier: interfaces.ServiceIdentifier<any>, name: string) => {
    return fluentProvide(identifier)
        .whenTargetNamed(name)
        .done();
};

const provideSingleton = (identifier: interfaces.ServiceIdentifier<any>) => {
    return fluentProvide(identifier)
        .inSingletonScope()
        .done();
};

export { autoProvide, provide, provideNamed, provideSingleton, inject, buildProviderModule };
