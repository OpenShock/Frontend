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

import { exists, mapValues } from '../runtime';
import type { LcgResponse } from './LcgResponse';
import {
    LcgResponseFromJSON,
    LcgResponseFromJSONTyped,
    LcgResponseToJSON,
} from './LcgResponse';

/**
 * 
 * @export
 * @interface LcgResponseBaseResponse
 */
export interface LcgResponseBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof LcgResponseBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {LcgResponse}
     * @memberof LcgResponseBaseResponse
     */
    data?: LcgResponse;
}

/**
 * Check if a given object implements the LcgResponseBaseResponse interface.
 */
export function instanceOfLcgResponseBaseResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function LcgResponseBaseResponseFromJSON(json: any): LcgResponseBaseResponse {
    return LcgResponseBaseResponseFromJSONTyped(json, false);
}

export function LcgResponseBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): LcgResponseBaseResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'message': !exists(json, 'message') ? undefined : json['message'],
        'data': !exists(json, 'data') ? undefined : LcgResponseFromJSON(json['data']),
    };
}

export function LcgResponseBaseResponseToJSON(value?: LcgResponseBaseResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'message': value.message,
        'data': LcgResponseToJSON(value.data),
    };
}

