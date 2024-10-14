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
 * @interface ChangePasswordRequest
 */
export interface ChangePasswordRequest {
    /**
     * 
     * @type {string}
     * @memberof ChangePasswordRequest
     */
    oldPassword: string | null;
    /**
     * 
     * @type {string}
     * @memberof ChangePasswordRequest
     */
    newPassword: string | null;
}

/**
 * Check if a given object implements the ChangePasswordRequest interface.
 */
export function instanceOfChangePasswordRequest(value: object): value is ChangePasswordRequest {
    if (!('oldPassword' in value) || value['oldPassword'] === undefined) return false;
    if (!('newPassword' in value) || value['newPassword'] === undefined) return false;
    return true;
}

export function ChangePasswordRequestFromJSON(json: any): ChangePasswordRequest {
    return ChangePasswordRequestFromJSONTyped(json, false);
}

export function ChangePasswordRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ChangePasswordRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'oldPassword': json['oldPassword'],
        'newPassword': json['newPassword'],
    };
}

export function ChangePasswordRequestToJSON(value?: ChangePasswordRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'oldPassword': value['oldPassword'],
        'newPassword': value['newPassword'],
    };
}

