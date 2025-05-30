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
 * @interface ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse
 */
export interface ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse {
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse
     */
    message: string;
    /**
     * 
     * @type {Array<ResponseDeviceWithShockers>}
     * @memberof ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse
     */
    data: Array<ResponseDeviceWithShockers> | null;
}

/**
 * Check if a given object implements the ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse interface.
 */
export function instanceOfResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse(value: object): value is ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse {
    if (!('message' in value) || value['message'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    return true;
}

export function ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponseFromJSON(json: any): ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse {
    return ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponseFromJSONTyped(json, false);
}

export function ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'],
        'data': (json['data'] == null ? null : (json['data'] as Array<any>).map(ResponseDeviceWithShockersFromJSON)),
    };
}

export function ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponseToJSON(json: any): ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse {
    return ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponseToJSONTyped(json, false);
}

export function ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponseToJSONTyped(value?: ResponseDeviceWithShockersIAsyncEnumerableLegacyDataResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': (value['data'] == null ? null : (value['data'] as Array<any>).map(ResponseDeviceWithShockersToJSON)),
    };
}

