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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface DeviceEdit
 */
export interface DeviceEdit {
    /**
     * 
     * @type {string}
     * @memberof DeviceEdit
     */
    name?: string | null;
}

/**
 * Check if a given object implements the DeviceEdit interface.
 */
export function instanceOfDeviceEdit(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function DeviceEditFromJSON(json: any): DeviceEdit {
    return DeviceEditFromJSONTyped(json, false);
}

export function DeviceEditFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeviceEdit {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': !exists(json, 'name') ? undefined : json['name'],
    };
}

export function DeviceEditToJSON(value?: DeviceEdit | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
    };
}
