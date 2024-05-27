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
 * @interface PauseRequest
 */
export interface PauseRequest {
    /**
     * 
     * @type {boolean}
     * @memberof PauseRequest
     */
    pause: boolean;
}

/**
 * Check if a given object implements the PauseRequest interface.
 */
export function instanceOfPauseRequest(value: object): value is PauseRequest {
    if (!('pause' in value) || value['pause'] === undefined) return false;
    return true;
}

export function PauseRequestFromJSON(json: any): PauseRequest {
    return PauseRequestFromJSONTyped(json, false);
}

export function PauseRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): PauseRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'pause': json['pause'],
    };
}

export function PauseRequestToJSON(value?: PauseRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'pause': value['pause'],
    };
}

