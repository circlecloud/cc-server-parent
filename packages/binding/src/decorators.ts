import 'reflect-metadata'
import { METADATA_KEY, VAILD_TYPE } from './constants';
import { getVaildControllerMetadata, getVaildModelMetadata } from './utils'
import { VaildFunction, interfaces } from './interfaces'
/**
 * ParameterVaild
 */
export function Vaild(): ParameterDecorator {
    return (controller: Object, methodName: string, index: number): void => {
        var type = Reflect.getMetadata("design:paramtypes", controller, methodName)[index];
        let metadataList = getVaildControllerMetadata(controller.constructor);
        let parameterMetadataList = metadataList[methodName] || [];
        let parameterMetadata: interfaces.ParameterMetadata = {
            index: index,
            type: type
        };
        parameterMetadataList.unshift(parameterMetadata);
        metadataList[methodName] = parameterMetadataList;
        Reflect.defineMetadata(METADATA_KEY.vaildController, metadataList, controller.constructor);
    }
}

let vaildFunctions: {
    [methodName: string]: VaildFunction;
} = {};

/**
 * Vaild Blank String
 * @param message Error Message
 */
export const NotBlank: (message?: string) => PropertyDecorator = vaildDecoratorFactory(
    VAILD_TYPE.NOT_BLANK, (param) => !!param);
/**
 * Vaild Null Param
 * @param message Error Message
 */
export const NotNull: (message?: string) => PropertyDecorator = vaildDecoratorFactory(
    VAILD_TYPE.NOT_NULL, (param) => param !== undefined
);

function vaildDecoratorFactory(type: VAILD_TYPE, handle: VaildFunction): () => PropertyDecorator {
    vaildFunctions[type] = handle;
    return function(message?: string): PropertyDecorator {
        return vaildProperty(type, message);
    };
}

function vaildProperty(type: VAILD_TYPE, message?: string): PropertyDecorator {
    return (model: Object, propertyKey: string) => {
        let metadataList: interfaces.PropertyMetadata[] = getVaildModelMetadata(model.constructor);
        metadataList.push({
            type: type,
            name: propertyKey,
            message: message || `model ${model.constructor.name} property ${propertyKey} vaild failed => ${VAILD_TYPE[type]}`,
            handle: vaildFunctions[type]
        })
        Reflect.defineMetadata(METADATA_KEY.vaildModel, metadataList, model.constructor);
    }
}
