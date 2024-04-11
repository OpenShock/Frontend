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
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithToken
     */
    name?: string;
    /**
     * 
     * @type {Date}
     * @memberof ResponseDeviceWithToken
     */
    createdOn?: Date;
    /**
     * 
     * @type {string}
     * @memberof ResponseDeviceWithToken
     */
    token?: string;
}

/**
 * Check if a given object implements the ResponseDeviceWithToken interface.
 */
export function instanceOfResponseDeviceWithToken(value: object): boolean {
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
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'createdOn': json['createdOn'] == null ? undefined : (new Date(json['createdOn'])),
        'token': json['token'] == null ? undefined : json['token'],
    };
}

export function ResponseDeviceWithTokenToJSON(value?: ResponseDeviceWithToken | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'createdOn': value['createdOn'] == null ? undefined : ((value['createdOn']).toISOString()),
        'token': value['token'],
    };
}

