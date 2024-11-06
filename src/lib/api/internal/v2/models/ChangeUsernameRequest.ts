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
 * @interface ChangeUsernameRequest
 */
export interface ChangeUsernameRequest {
    /**
     * 
     * @type {string}
     * @memberof ChangeUsernameRequest
     */
    username: string;
}

/**
 * Check if a given object implements the ChangeUsernameRequest interface.
 */
export function instanceOfChangeUsernameRequest(value: object): value is ChangeUsernameRequest {
    if (!('username' in value) || value['username'] === undefined) return false;
    return true;
}

export function ChangeUsernameRequestFromJSON(json: any): ChangeUsernameRequest {
    return ChangeUsernameRequestFromJSONTyped(json, false);
}

export function ChangeUsernameRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ChangeUsernameRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'username': json['username'],
    };
}

  export function ChangeUsernameRequestToJSON(json: any): ChangeUsernameRequest {
      return ChangeUsernameRequestToJSONTyped(json, false);
  }

  export function ChangeUsernameRequestToJSONTyped(value?: ChangeUsernameRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'username': value['username'],
    };
}

