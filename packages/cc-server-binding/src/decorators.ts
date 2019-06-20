import 'reflect-metadata'
import { METADATA_KEY, VAILD_TYPE } from './constants';
import { getVaildControllerMetadata, getVaildModelMetadata } from './utils'
import { interfaces } from './interfaces'
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

/**
 * Vaild Blank String
 * @param message Error Message
 */
export const NotBlank: (message?: string) => PropertyDecorator = vaildDecoratorFactory(VAILD_TYPE.NOT_BLANK);
/**
 * Vaild Null Param
 * @param message Error Message
 */
export const NotNull: (message?: string) => PropertyDecorator = vaildDecoratorFactory(VAILD_TYPE.NOT_NULL);

function vaildDecoratorFactory(type: VAILD_TYPE): () => PropertyDecorator {
    return function(message?: string): PropertyDecorator {
        return vaildProperty(type, message);
    };
}

function vaildProperty(type: VAILD_TYPE, message?: string): PropertyDecorator {
    return (model: Object, propertyKey: string) => {
        let metadataList: interfaces.PropertyMetadata[] = getVaildModelMetadata(model.constructor);
        metadataList.push({
            name: propertyKey,
            message: message || `model ${model.constructor.name} property ${propertyKey} vaild failed => ${VAILD_TYPE[type]}`,
            type: type
        })
        Reflect.defineMetadata(METADATA_KEY.vaildModel, metadataList, model.constructor);
    }
}
