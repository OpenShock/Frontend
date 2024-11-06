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
import type { UsernameErrorType } from './UsernameErrorType';
import {
    UsernameErrorTypeFromJSON,
    UsernameErrorTypeFromJSONTyped,
    UsernameErrorTypeToJSON,
    UsernameErrorTypeToJSONTyped,
} from './UsernameErrorType';

/**
 * 
 * @export
 * @interface UsernameError
 */
export interface UsernameError {
    /**
     * 
     * @type {string}
     * @memberof UsernameError
     */
    message: string;
    /**
     * 
     * @type {UsernameErrorType}
     * @memberof UsernameError
     */
    type: UsernameErrorType;
}



/**
 * Check if a given object implements the UsernameError interface.
 */
export function instanceOfUsernameError(value: object): value is UsernameError {
    if (!('message' in value) || value['message'] === undefined) return false;
    if (!('type' in value) || value['type'] === undefined) return false;
    return true;
}

export function UsernameErrorFromJSON(json: any): UsernameError {
    return UsernameErrorFromJSONTyped(json, false);
}

export function UsernameErrorFromJSONTyped(json: any, ignoreDiscriminator: boolean): UsernameError {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'],
        'type': UsernameErrorTypeFromJSON(json['type']),
    };
}

  export function UsernameErrorToJSON(json: any): UsernameError {
      return UsernameErrorToJSONTyped(json, false);
  }

  export function UsernameErrorToJSONTyped(value?: UsernameError | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'type': UsernameErrorTypeToJSON(value['type']),
    };
}

