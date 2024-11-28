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
import type { ResponseDeviceWithShockers } from './ResponseDeviceWithShockers';
import {
    ResponseDeviceWithShockersFromJSON,
    ResponseDeviceWithShockersFromJSONTyped,
    ResponseDeviceWithShockersToJSON,
    ResponseDeviceWithShockersToJSONTyped,
} from './ResponseDeviceWithShockers';

/**
 * 
 * @export
 * @interface ResponseDeviceWithShockersIEnumerableBaseResponse
 */
export interface ResponseDeviceWithShockersIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithShockersIEnumerableBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<ResponseDeviceWithShockers>}
     * @memberof ResponseDeviceWithShockersIEnumerableBaseResponse
     */
    data?: Array<ResponseDeviceWithShockers> | null;
}

/**
 * Check if a given object implements the ResponseDeviceWithShockersIEnumerableBaseResponse interface.
 */
export function instanceOfResponseDeviceWithShockersIEnumerableBaseResponse(value: object): value is ResponseDeviceWithShockersIEnumerableBaseResponse {
    return true;
}

export function ResponseDeviceWithShockersIEnumerableBaseResponseFromJSON(json: any): ResponseDeviceWithShockersIEnumerableBaseResponse {
    return ResponseDeviceWithShockersIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function ResponseDeviceWithShockersIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResponseDeviceWithShockersIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ((json['data'] as Array<any>).map(ResponseDeviceWithShockersFromJSON)),
    };
}

export function ResponseDeviceWithShockersIEnumerableBaseResponseToJSON(json: any): ResponseDeviceWithShockersIEnumerableBaseResponse {
    return ResponseDeviceWithShockersIEnumerableBaseResponseToJSONTyped(json, false);
}

export function ResponseDeviceWithShockersIEnumerableBaseResponseToJSONTyped(value?: ResponseDeviceWithShockersIEnumerableBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': value['data'] == null ? undefined : ((value['data'] as Array<any>).map(ResponseDeviceWithShockersToJSON)),
    };
}

