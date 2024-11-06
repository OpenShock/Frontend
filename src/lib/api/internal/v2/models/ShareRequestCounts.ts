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
 * @interface ShareRequestCounts
 */
export interface ShareRequestCounts {
    /**
     * 
     * @type {number}
     * @memberof ShareRequestCounts
     */
    shockers: number;
}

/**
 * Check if a given object implements the ShareRequestCounts interface.
 */
export function instanceOfShareRequestCounts(value: object): value is ShareRequestCounts {
    if (!('shockers' in value) || value['shockers'] === undefined) return false;
    return true;
}

export function ShareRequestCountsFromJSON(json: any): ShareRequestCounts {
    return ShareRequestCountsFromJSONTyped(json, false);
}

export function ShareRequestCountsFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareRequestCounts {
    if (json == null) {
        return json;
    }
    return {
        
        'shockers': json['shockers'],
    };
}

  export function ShareRequestCountsToJSON(json: any): ShareRequestCounts {
      return ShareRequestCountsToJSONTyped(json, false);
  }

  export function ShareRequestCountsToJSONTyped(value?: ShareRequestCounts | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'shockers': value['shockers'],
    };
}

