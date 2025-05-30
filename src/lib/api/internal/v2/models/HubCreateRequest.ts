/* tslint:disable */
/* eslint-disable */
/**
 * OpenShock.API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2
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
 * @interface HubCreateRequest
 */
export interface HubCreateRequest {
    /**
     * 
     * @type {string}
     * @memberof HubCreateRequest
     */
    name: string;
}

/**
 * Check if a given object implements the HubCreateRequest interface.
 */
export function instanceOfHubCreateRequest(value: object): value is HubCreateRequest {
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function HubCreateRequestFromJSON(json: any): HubCreateRequest {
    return HubCreateRequestFromJSONTyped(json, false);
}

export function HubCreateRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): HubCreateRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
    };
}

export function HubCreateRequestToJSON(json: any): HubCreateRequest {
    return HubCreateRequestToJSONTyped(json, false);
}

export function HubCreateRequestToJSONTyped(value?: HubCreateRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
    };
}

