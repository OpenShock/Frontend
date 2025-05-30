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
import type { ShareCodeInfo } from './ShareCodeInfo';
import {
    ShareCodeInfoFromJSON,
    ShareCodeInfoFromJSONTyped,
    ShareCodeInfoToJSON,
    ShareCodeInfoToJSONTyped,
} from './ShareCodeInfo';

/**
 * 
 * @export
 * @interface ShareCodeInfoIAsyncEnumerableLegacyDataResponse
 */
export interface ShareCodeInfoIAsyncEnumerableLegacyDataResponse {
    /**
     * 
     * @type {string}
     * @memberof ShareCodeInfoIAsyncEnumerableLegacyDataResponse
     */
    message: string;
    /**
     * 
     * @type {Array<ShareCodeInfo>}
     * @memberof ShareCodeInfoIAsyncEnumerableLegacyDataResponse
     */
    data: Array<ShareCodeInfo> | null;
}

/**
 * Check if a given object implements the ShareCodeInfoIAsyncEnumerableLegacyDataResponse interface.
 */
export function instanceOfShareCodeInfoIAsyncEnumerableLegacyDataResponse(value: object): value is ShareCodeInfoIAsyncEnumerableLegacyDataResponse {
    if (!('message' in value) || value['message'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    return true;
}

export function ShareCodeInfoIAsyncEnumerableLegacyDataResponseFromJSON(json: any): ShareCodeInfoIAsyncEnumerableLegacyDataResponse {
    return ShareCodeInfoIAsyncEnumerableLegacyDataResponseFromJSONTyped(json, false);
}

export function ShareCodeInfoIAsyncEnumerableLegacyDataResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareCodeInfoIAsyncEnumerableLegacyDataResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'],
        'data': (json['data'] == null ? null : (json['data'] as Array<any>).map(ShareCodeInfoFromJSON)),
    };
}

export function ShareCodeInfoIAsyncEnumerableLegacyDataResponseToJSON(json: any): ShareCodeInfoIAsyncEnumerableLegacyDataResponse {
    return ShareCodeInfoIAsyncEnumerableLegacyDataResponseToJSONTyped(json, false);
}

export function ShareCodeInfoIAsyncEnumerableLegacyDataResponseToJSONTyped(value?: ShareCodeInfoIAsyncEnumerableLegacyDataResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': (value['data'] == null ? null : (value['data'] as Array<any>).map(ShareCodeInfoToJSON)),
    };
}

