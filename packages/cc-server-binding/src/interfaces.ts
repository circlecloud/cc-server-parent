import { VAILD_TYPE } from './constants'

namespace interfaces {
    export interface MethodMetadata {
        [methodName: string]: ParameterMetadata[];
    }

    export interface ParameterMetadata {
        index: number;
        type: NewableFunction;
    }

    export interface PropertyMetadata {
        name: string;
        message: string;
        type: VAILD_TYPE;
    }
}

export { interfaces };