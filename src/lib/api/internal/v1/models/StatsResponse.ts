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
 * @interface StatsResponse
 */
export interface StatsResponse {
    /**
     * 
     * @type {number}
     * @memberof StatsResponse
     */
    devicesOnline: number;
}

/**
 * Check if a given object implements the StatsResponse interface.
 */
export function instanceOfStatsResponse(value: object): value is StatsResponse {
    if (!('devicesOnline' in value) || value['devicesOnline'] === undefined) return false;
    return true;
}

export function StatsResponseFromJSON(json: any): StatsResponse {
    return StatsResponseFromJSONTyped(json, false);
}

export function StatsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): StatsResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'devicesOnline': json['devicesOnline'],
    };
}

export function StatsResponseToJSON(json: any): StatsResponse {
    return StatsResponseToJSONTyped(json, false);
}

export function StatsResponseToJSONTyped(value?: StatsResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'devicesOnline': value['devicesOnline'],
    };
}

