/* tslint:disable */
/* eslint-disable */
/**
 * OpenShock.API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { RootResponse } from './RootResponse';
import {
    RootResponseFromJSON,
    RootResponseFromJSONTyped,
    RootResponseToJSON,
} from './RootResponse';

/**
 * 
 * @export
 * @interface RootResponseBaseResponse
 */
export interface RootResponseBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof RootResponseBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {RootResponse}
     * @memberof RootResponseBaseResponse
     */
    data?: RootResponse;
}

/**
 * Check if a given object implements the RootResponseBaseResponse interface.
 */
export function instanceOfRootResponseBaseResponse(value: object): value is RootResponseBaseResponse {
    return true;
}

export function RootResponseBaseResponseFromJSON(json: any): RootResponseBaseResponse {
    return RootResponseBaseResponseFromJSONTyped(json, false);
}

export function RootResponseBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): RootResponseBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : RootResponseFromJSON(json['data']),
    };
}

export function RootResponseBaseResponseToJSON(value?: RootResponseBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': RootResponseToJSON(value['data']),
    };
}

