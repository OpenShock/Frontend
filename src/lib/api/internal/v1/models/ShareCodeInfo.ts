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
 * @interface ShareCodeInfo
 */
export interface ShareCodeInfo {
    /**
     * 
     * @type {string}
     * @memberof ShareCodeInfo
     */
    id?: string;
    /**
     * 
     * @type {Date}
     * @memberof ShareCodeInfo
     */
    createdOn?: Date;
}

/**
 * Check if a given object implements the ShareCodeInfo interface.
 */
export function instanceOfShareCodeInfo(value: object): boolean {
    return true;
}

export function ShareCodeInfoFromJSON(json: any): ShareCodeInfo {
    return ShareCodeInfoFromJSONTyped(json, false);
}

export function ShareCodeInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareCodeInfo {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'createdOn': json['createdOn'] == null ? undefined : (new Date(json['createdOn'])),
    };
}

export function ShareCodeInfoToJSON(value?: ShareCodeInfo | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'createdOn': value['createdOn'] == null ? undefined : ((value['createdOn']).toISOString()),
    };
}

