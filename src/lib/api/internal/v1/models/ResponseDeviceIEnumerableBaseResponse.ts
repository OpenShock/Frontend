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
import type { ResponseDevice } from './ResponseDevice';
import {
    ResponseDeviceFromJSON,
    ResponseDeviceFromJSONTyped,
    ResponseDeviceToJSON,
    ResponseDeviceToJSONTyped,
} from './ResponseDevice';

/**
 * 
 * @export
 * @interface ResponseDeviceIEnumerableBaseResponse
 */
export interface ResponseDeviceIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceIEnumerableBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<ResponseDevice>}
     * @memberof ResponseDeviceIEnumerableBaseResponse
     */
    data?: Array<ResponseDevice> | null;
}

/**
 * Check if a given object implements the ResponseDeviceIEnumerableBaseResponse interface.
 */
export function instanceOfResponseDeviceIEnumerableBaseResponse(value: object): value is ResponseDeviceIEnumerableBaseResponse {
    return true;
}

export function ResponseDeviceIEnumerableBaseResponseFromJSON(json: any): ResponseDeviceIEnumerableBaseResponse {
    return ResponseDeviceIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function ResponseDeviceIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResponseDeviceIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ((json['data'] as Array<any>).map(ResponseDeviceFromJSON)),
    };
}

export function ResponseDeviceIEnumerableBaseResponseToJSON(json: any): ResponseDeviceIEnumerableBaseResponse {
    return ResponseDeviceIEnumerableBaseResponseToJSONTyped(json, false);
}

export function ResponseDeviceIEnumerableBaseResponseToJSONTyped(value?: ResponseDeviceIEnumerableBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': value['data'] == null ? undefined : ((value['data'] as Array<any>).map(ResponseDeviceToJSON)),
    };
}

