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
 * @interface LcgNodeResponse
 */
export interface LcgNodeResponse {
    /**
     * 
     * @type {string}
     * @memberof LcgNodeResponse
     */
    fqdn: string;
    /**
     * 
     * @type {string}
     * @memberof LcgNodeResponse
     */
    country: string;
}

/**
 * Check if a given object implements the LcgNodeResponse interface.
 */
export function instanceOfLcgNodeResponse(value: object): value is LcgNodeResponse {
    if (!('fqdn' in value) || value['fqdn'] === undefined) return false;
    if (!('country' in value) || value['country'] === undefined) return false;
    return true;
}

export function LcgNodeResponseFromJSON(json: any): LcgNodeResponse {
    return LcgNodeResponseFromJSONTyped(json, false);
}

export function LcgNodeResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): LcgNodeResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'fqdn': json['fqdn'],
        'country': json['country'],
    };
}

  export function LcgNodeResponseToJSON(json: any): LcgNodeResponse {
      return LcgNodeResponseToJSONTyped(json, false);
  }

  export function LcgNodeResponseToJSONTyped(value?: LcgNodeResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'fqdn': value['fqdn'],
        'country': value['country'],
    };
}

