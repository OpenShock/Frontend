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
import type { ResponseDeviceWithToken } from './ResponseDeviceWithToken';
import {
    ResponseDeviceWithTokenFromJSON,
    ResponseDeviceWithTokenFromJSONTyped,
    ResponseDeviceWithTokenToJSON,
    ResponseDeviceWithTokenToJSONTyped,
} from './ResponseDeviceWithToken';

/**
 * 
 * @export
 * @interface ResponseDeviceWithTokenLegacyDataResponse
 */
export interface ResponseDeviceWithTokenLegacyDataResponse {
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithTokenLegacyDataResponse
     */
    message: string;
    /**
     * 
     * @type {ResponseDeviceWithToken}
     * @memberof ResponseDeviceWithTokenLegacyDataResponse
     */
    data: ResponseDeviceWithToken;
}

/**
 * Check if a given object implements the ResponseDeviceWithTokenLegacyDataResponse interface.
 */
export function instanceOfResponseDeviceWithTokenLegacyDataResponse(value: object): value is ResponseDeviceWithTokenLegacyDataResponse {
    if (!('message' in value) || value['message'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    return true;
}

export function ResponseDeviceWithTokenLegacyDataResponseFromJSON(json: any): ResponseDeviceWithTokenLegacyDataResponse {
    return ResponseDeviceWithTokenLegacyDataResponseFromJSONTyped(json, false);
}

export function ResponseDeviceWithTokenLegacyDataResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResponseDeviceWithTokenLegacyDataResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'],
        'data': ResponseDeviceWithTokenFromJSON(json['data']),
    };
}

export function ResponseDeviceWithTokenLegacyDataResponseToJSON(json: any): ResponseDeviceWithTokenLegacyDataResponse {
    return ResponseDeviceWithTokenLegacyDataResponseToJSONTyped(json, false);
}

export function ResponseDeviceWithTokenLegacyDataResponseToJSONTyped(value?: ResponseDeviceWithTokenLegacyDataResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': ResponseDeviceWithTokenToJSON(value['data']),
    };
}

