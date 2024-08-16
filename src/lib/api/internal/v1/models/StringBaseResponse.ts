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
/**
 * 
 * @export
 * @interface StringBaseResponse
 */
export interface StringBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof StringBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {string}
     * @memberof StringBaseResponse
     */
    data?: string | null;
}

/**
 * Check if a given object implements the StringBaseResponse interface.
 */
export function instanceOfStringBaseResponse(value: object): value is StringBaseResponse {
    return true;
}

export function StringBaseResponseFromJSON(json: any): StringBaseResponse {
    return StringBaseResponseFromJSONTyped(json, false);
}

export function StringBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): StringBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : json['data'],
    };
}

export function StringBaseResponseToJSON(value?: StringBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': value['data'],
    };
}

