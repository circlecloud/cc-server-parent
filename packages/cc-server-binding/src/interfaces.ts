import { VAILD_TYPE } from './constants'

export class VaildError extends Error { }

export declare type VaildFunction = (param: object) => boolean;

export namespace interfaces {
    export interface MethodMetadata {
        [methodName: string]: ParameterMetadata[];
    }

    export interface ParameterMetadata {
        index: number;
        type: NewableFunction;
    }

    export interface PropertyMetadata {
        type: VAILD_TYPE;
        name: string;
        message: string;
        handle: VaildFunction;
    }
}
