import { METADATA_KEY } from './constants'
import { interfaces } from './interfaces'

function getVaildControllerMetadata(model: Object) {
    let controllerMetadata: interfaces.MethodMetadata = Reflect.getMetadata(
        METADATA_KEY.vaildController,
        model
    ) || {};
    return controllerMetadata;
}

function getVaildMethodMetadata(constructor: any) {
    let parameterMetadata: interfaces.ParameterMetadata[] = Reflect.getMetadata(
        METADATA_KEY.vaildMethod,
        constructor
    ) || [];
    return parameterMetadata;
}

function getVaildModelMetadata(model: Object) {
    let propertyMetadata: interfaces.PropertyMetadata[] = Reflect.getMetadata(
        METADATA_KEY.vaildModel,
        model
    ) || [];
    return propertyMetadata;
}

export {
    getVaildControllerMetadata,
    getVaildMethodMetadata,
    getVaildModelMetadata
}