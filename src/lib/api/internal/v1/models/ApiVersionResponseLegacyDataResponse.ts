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
import type { ApiVersionResponse } from './ApiVersionResponse';
import {
    ApiVersionResponseFromJSON,
    ApiVersionResponseFromJSONTyped,
    ApiVersionResponseToJSON,
    ApiVersionResponseToJSONTyped,
} from './ApiVersionResponse';

/**
 * 
 * @export
 * @interface ApiVersionResponseLegacyDataResponse
 */
export interface ApiVersionResponseLegacyDataResponse {
    /**
     * 
     * @type {string}
     * @memberof ApiVersionResponseLegacyDataResponse
     */
    message: string;
    /**
     * 
     * @type {ApiVersionResponse}
     * @memberof ApiVersionResponseLegacyDataResponse
     */
    data: ApiVersionResponse;
}

/**
 * Check if a given object implements the ApiVersionResponseLegacyDataResponse interface.
 */
export function instanceOfApiVersionResponseLegacyDataResponse(value: object): value is ApiVersionResponseLegacyDataResponse {
    if (!('message' in value) || value['message'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    return true;
}

export function ApiVersionResponseLegacyDataResponseFromJSON(json: any): ApiVersionResponseLegacyDataResponse {
    return ApiVersionResponseLegacyDataResponseFromJSONTyped(json, false);
}

export function ApiVersionResponseLegacyDataResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApiVersionResponseLegacyDataResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'],
        'data': ApiVersionResponseFromJSON(json['data']),
    };
}

export function ApiVersionResponseLegacyDataResponseToJSON(json: any): ApiVersionResponseLegacyDataResponse {
    return ApiVersionResponseLegacyDataResponseToJSONTyped(json, false);
}

export function ApiVersionResponseLegacyDataResponseToJSONTyped(value?: ApiVersionResponseLegacyDataResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': ApiVersionResponseToJSON(value['data']),
    };
}

