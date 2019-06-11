import "reflect-metadata";
import { Container, inject } from 'inversify';
import { autoProvide, provide, fluentProvide, buildProviderModule } from 'inversify-binding-decorators';

let container = new Container();
// Reflects all decorators provided by this package and packages them into
// a module to be loaded by the container
// container.load(buildProviderModule());

const provideNamed = (identifier, name) => {
    return fluentProvide(identifier)
        .whenTargetNamed(name)
        .done();
};

const provideSingleton = (identifier: any) => {
    return fluentProvide(identifier)
        .inSingletonScope()
        .done();
};

export { container, autoProvide, provide, provideNamed, provideSingleton, inject, buildProviderModule };
