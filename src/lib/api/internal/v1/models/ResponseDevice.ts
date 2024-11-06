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
 * @interface ResponseDevice
 */
export interface ResponseDevice {
    /**
     * 
     * @type {string}
     * @memberof ResponseDevice
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ResponseDevice
     */
    name: string;
    /**
     * 
     * @type {Date}
     * @memberof ResponseDevice
     */
    createdOn: Date;
}

/**
 * Check if a given object implements the ResponseDevice interface.
 */
export function instanceOfResponseDevice(value: object): value is ResponseDevice {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('createdOn' in value) || value['createdOn'] === undefined) return false;
    return true;
}

export function ResponseDeviceFromJSON(json: any): ResponseDevice {
    return ResponseDeviceFromJSONTyped(json, false);
}

export function ResponseDeviceFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResponseDevice {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'createdOn': (new Date(json['createdOn'])),
    };
}

  export function ResponseDeviceToJSON(json: any): ResponseDevice {
      return ResponseDeviceToJSONTyped(json, false);
  }

  export function ResponseDeviceToJSONTyped(value?: ResponseDevice | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'createdOn': ((value['createdOn']).toISOString()),
    };
}

