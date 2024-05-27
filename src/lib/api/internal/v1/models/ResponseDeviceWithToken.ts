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
 * @interface ResponseDeviceWithToken
 */
export interface ResponseDeviceWithToken {
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithToken
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithToken
     */
    name: string | null;
    /**
     * 
     * @type {Date}
     * @memberof ResponseDeviceWithToken
     */
    createdOn: Date;
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithToken
     */
    token: string | null;
}

/**
 * Check if a given object implements the ResponseDeviceWithToken interface.
 */
export function instanceOfResponseDeviceWithToken(value: object): boolean {
    if (!('id' in value)) return false;
    if (!('name' in value)) return false;
    if (!('createdOn' in value)) return false;
    if (!('token' in value)) return false;
    return true;
}

export function ResponseDeviceWithTokenFromJSON(json: any): ResponseDeviceWithToken {
    return ResponseDeviceWithTokenFromJSONTyped(json, false);
}

export function ResponseDeviceWithTokenFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResponseDeviceWithToken {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'createdOn': (new Date(json['createdOn'])),
        'token': json['token'],
    };
}

export function ResponseDeviceWithTokenToJSON(value?: ResponseDeviceWithToken | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'createdOn': ((value['createdOn']).toISOString()),
        'token': value['token'],
    };
}

