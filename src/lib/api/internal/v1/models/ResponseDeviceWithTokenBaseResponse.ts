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
 * @interface ResponseDeviceWithTokenBaseResponse
 */
export interface ResponseDeviceWithTokenBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithTokenBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {ResponseDeviceWithToken}
     * @memberof ResponseDeviceWithTokenBaseResponse
     */
    data?: ResponseDeviceWithToken;
}

/**
 * Check if a given object implements the ResponseDeviceWithTokenBaseResponse interface.
 */
export function instanceOfResponseDeviceWithTokenBaseResponse(value: object): value is ResponseDeviceWithTokenBaseResponse {
    return true;
}

export function ResponseDeviceWithTokenBaseResponseFromJSON(json: any): ResponseDeviceWithTokenBaseResponse {
    return ResponseDeviceWithTokenBaseResponseFromJSONTyped(json, false);
}

export function ResponseDeviceWithTokenBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResponseDeviceWithTokenBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ResponseDeviceWithTokenFromJSON(json['data']),
    };
}

export function ResponseDeviceWithTokenBaseResponseToJSON(json: any): ResponseDeviceWithTokenBaseResponse {
    return ResponseDeviceWithTokenBaseResponseToJSONTyped(json, false);
}

export function ResponseDeviceWithTokenBaseResponseToJSONTyped(value?: ResponseDeviceWithTokenBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': ResponseDeviceWithTokenToJSON(value['data']),
    };
}

