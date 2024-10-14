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
 * @interface ChangeEmailRequest
 */
export interface ChangeEmailRequest {
    /**
     * 
     * @type {string}
     * @memberof ChangeEmailRequest
     */
    email: string | null;
}

/**
 * Check if a given object implements the ChangeEmailRequest interface.
 */
export function instanceOfChangeEmailRequest(value: object): value is ChangeEmailRequest {
    if (!('email' in value) || value['email'] === undefined) return false;
    return true;
}

export function ChangeEmailRequestFromJSON(json: any): ChangeEmailRequest {
    return ChangeEmailRequestFromJSONTyped(json, false);
}

export function ChangeEmailRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ChangeEmailRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'email': json['email'],
    };
}

export function ChangeEmailRequestToJSON(value?: ChangeEmailRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'email': value['email'],
    };
}
