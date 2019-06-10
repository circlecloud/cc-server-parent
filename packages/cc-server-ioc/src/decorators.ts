import 'reflect-metadata'
import { Container } from 'inversify';
import { METADATA_KEY } from './constant/types';

function service(name: string | symbol) {
    return function(target: any) {
        let services = Reflect.getMetadata(METADATA_KEY.service, Reflect) || []
        services = [() => {
            let container: Container = Reflect.getMetadata(METADATA_KEY.container, Reflect)
            container.bind(name || target).to(target);
        }, ...services]
        Reflect.defineMetadata(METADATA_KEY.service, services, Reflect)
    }
}

export { service }
