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
 * @interface GuidBaseResponse
 */
export interface GuidBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof GuidBaseResponse
     */
    message?: string;
    /**
     * 
     * @type {string}
     * @memberof GuidBaseResponse
     */
    data?: string;
}

/**
 * Check if a given object implements the GuidBaseResponse interface.
 */
export function instanceOfGuidBaseResponse(value: object): boolean {
    return true;
}

export function GuidBaseResponseFromJSON(json: any): GuidBaseResponse {
    return GuidBaseResponseFromJSONTyped(json, false);
}

export function GuidBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GuidBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : json['data'],
    };
}

export function GuidBaseResponseToJSON(value?: GuidBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': value['data'],
    };
}

