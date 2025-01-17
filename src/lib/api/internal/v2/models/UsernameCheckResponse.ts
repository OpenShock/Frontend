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
import type { UsernameAvailability } from './UsernameAvailability';
import {
    UsernameAvailabilityFromJSON,
    UsernameAvailabilityFromJSONTyped,
    UsernameAvailabilityToJSON,
    UsernameAvailabilityToJSONTyped,
} from './UsernameAvailability';
import type { UsernameError } from './UsernameError';
import {
    UsernameErrorFromJSON,
    UsernameErrorFromJSONTyped,
    UsernameErrorToJSON,
    UsernameErrorToJSONTyped,
} from './UsernameError';

/**
 * 
 * @export
 * @interface UsernameCheckResponse
 */
export interface UsernameCheckResponse {
    /**
     * 
     * @type {UsernameAvailability}
     * @memberof UsernameCheckResponse
     */
    availability: UsernameAvailability;
    /**
     * 
     * @type {UsernameError}
     * @memberof UsernameCheckResponse
     */
    error?: UsernameError;
}



/**
 * Check if a given object implements the UsernameCheckResponse interface.
 */
export function instanceOfUsernameCheckResponse(value: object): value is UsernameCheckResponse {
    if (!('availability' in value) || value['availability'] === undefined) return false;
    return true;
}

export function UsernameCheckResponseFromJSON(json: any): UsernameCheckResponse {
    return UsernameCheckResponseFromJSONTyped(json, false);
}

export function UsernameCheckResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): UsernameCheckResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'availability': UsernameAvailabilityFromJSON(json['availability']),
        'error': json['error'] == null ? undefined : UsernameErrorFromJSON(json['error']),
    };
}

export function UsernameCheckResponseToJSON(json: any): UsernameCheckResponse {
    return UsernameCheckResponseToJSONTyped(json, false);
}

export function UsernameCheckResponseToJSONTyped(value?: UsernameCheckResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'availability': UsernameAvailabilityToJSON(value['availability']),
        'error': UsernameErrorToJSON(value['error']),
    };
}

