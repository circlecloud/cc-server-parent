import { Container, interfaces as inversify_interfaces } from 'inversify'
import { TYPE, interfaces as express_interfaces } from 'inversify-express-utils'
import { METADATA_KEY, VAILD_TYPE } from './constants'
import { interfaces } from './interfaces'
import { getVaildMethodMetadata, getVaildControllerMetadata, getVaildModelMetadata } from './utils'

let handler = {
    apply: function(target: Function, thisArgument: Object, argumentsList: any[]) {
        let methodParams = getVaildMethodMetadata(target);
        let [req, res, next] = [...argumentsList.slice(-3)];
        try {
            // loop @Valid params
            for (const param of methodParams) {
                // get function argument value
                let origin = argumentsList[param.index]
                let props = getVaildModelMetadata(param.type);
                for (const prop of props) {
                    let propValue = origin[prop.name];
                    switch (prop.type) {
                        case VAILD_TYPE.NOT_BLANK:
                            if (!propValue) {
                                throw new Error(prop.message);
                            }
                            break;
                        case VAILD_TYPE.NOT_NULL:
                            if (propValue == undefined) {
                                throw new Error(prop.message);
                            }
                            break;
                        default:
                            throw new Error('Unkonw Vaild Type!')
                    }
                }
            }
            return target.apply(thisArgument, argumentsList);
        } catch (ex) {
            res.status(400).json({
                status: 400,
                message: ex.message
            })
        }
    }
}

function rebuildServer(container: Container) {
    // get all controller
    let controllers = container.getAll<express_interfaces.Controller>(TYPE.Controller)
    // for loop controllers and inject proxy to each method
    for (const controller of controllers) {
        container.rebind(TYPE.Controller)
            .to(controller.constructor as any)
            .inSingletonScope()
            .whenTargetNamed(controller.constructor.name)
            .onActivation((ctx: inversify_interfaces.Context, controller: express_interfaces.Controller) => {
                let prop = controller.constructor.prototype
                // funcs => { create: [ { index: 0, type: [Function: ExampleModel] } ] }
                let funcs = getVaildControllerMetadata(controller.constructor);
                //Reflect.getMetadata(METADATA_KEY.controllerParameter, controller.constructor);
                for (const func in funcs) {
                    Reflect.defineMetadata(METADATA_KEY.vaildMethod, funcs[func], prop[func])
                    // Define Proxy handle model vaild
                    Reflect.defineProperty(prop, func, { value: new Proxy(prop[func], handler) })
                }
                return controller;
            });
    }
}

export { rebuildServer }