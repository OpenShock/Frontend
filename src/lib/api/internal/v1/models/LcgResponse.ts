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
 * @interface LcgResponse
 */
export interface LcgResponse {
    /**
     * 
     * @type {string}
     * @memberof LcgResponse
     */
    gateway: string;
    /**
     * 
     * @type {string}
     * @memberof LcgResponse
     */
    country: string;
}

/**
 * Check if a given object implements the LcgResponse interface.
 */
export function instanceOfLcgResponse(value: object): value is LcgResponse {
    if (!('gateway' in value) || value['gateway'] === undefined) return false;
    if (!('country' in value) || value['country'] === undefined) return false;
    return true;
}

export function LcgResponseFromJSON(json: any): LcgResponse {
    return LcgResponseFromJSONTyped(json, false);
}

export function LcgResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): LcgResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'gateway': json['gateway'],
        'country': json['country'],
    };
}

export function LcgResponseToJSON(json: any): LcgResponse {
    return LcgResponseToJSONTyped(json, false);
}

export function LcgResponseToJSONTyped(value?: LcgResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'gateway': value['gateway'],
        'country': value['country'],
    };
}

