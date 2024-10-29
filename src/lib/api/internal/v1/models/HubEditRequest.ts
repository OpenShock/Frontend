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
 * @interface HubEditRequest
 */
export interface HubEditRequest {
    /**
     * 
     * @type {string}
     * @memberof HubEditRequest
     */
    name: string;
}

/**
 * Check if a given object implements the HubEditRequest interface.
 */
export function instanceOfHubEditRequest(value: object): value is HubEditRequest {
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function HubEditRequestFromJSON(json: any): HubEditRequest {
    return HubEditRequestFromJSONTyped(json, false);
}

export function HubEditRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): HubEditRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
    };
}

  export function HubEditRequestToJSON(json: any): HubEditRequest {
      return HubEditRequestToJSONTyped(json, false);
  }

  export function HubEditRequestToJSONTyped(value?: HubEditRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
    };
}

