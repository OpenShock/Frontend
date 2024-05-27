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
import type { SelfResponse } from './SelfResponse';
import {
    SelfResponseFromJSON,
    SelfResponseFromJSONTyped,
    SelfResponseToJSON,
} from './SelfResponse';

/**
 * 
 * @export
 * @interface SelfResponseBaseResponse
 */
export interface SelfResponseBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof SelfResponseBaseResponse
     */
    message?: string;
    /**
     * 
     * @type {SelfResponse}
     * @memberof SelfResponseBaseResponse
     */
    data?: SelfResponse;
}

/**
 * Check if a given object implements the SelfResponseBaseResponse interface.
 */
export function instanceOfSelfResponseBaseResponse(value: object): value is SelfResponseBaseResponse {
    return true;
}

export function SelfResponseBaseResponseFromJSON(json: any): SelfResponseBaseResponse {
    return SelfResponseBaseResponseFromJSONTyped(json, false);
}

export function SelfResponseBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): SelfResponseBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : SelfResponseFromJSON(json['data']),
    };
}

export function SelfResponseBaseResponseToJSON(value?: SelfResponseBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': SelfResponseToJSON(value['data']),
    };
}

