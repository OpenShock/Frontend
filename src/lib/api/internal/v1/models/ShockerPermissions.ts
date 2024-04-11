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
 * @interface ShockerPermissions
 */
export interface ShockerPermissions {
    /**
     * 
     * @type {boolean}
     * @memberof ShockerPermissions
     */
    vibrate?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof ShockerPermissions
     */
    sound?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof ShockerPermissions
     */
    shock?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof ShockerPermissions
     */
    live?: boolean;
}

/**
 * Check if a given object implements the ShockerPermissions interface.
 */
export function instanceOfShockerPermissions(value: object): boolean {
    return true;
}

export function ShockerPermissionsFromJSON(json: any): ShockerPermissions {
    return ShockerPermissionsFromJSONTyped(json, false);
}

export function ShockerPermissionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShockerPermissions {
    if (json == null) {
        return json;
    }
    return {
        
        'vibrate': json['vibrate'] == null ? undefined : json['vibrate'],
        'sound': json['sound'] == null ? undefined : json['sound'],
        'shock': json['shock'] == null ? undefined : json['shock'],
        'live': json['live'] == null ? undefined : json['live'],
    };
}

export function ShockerPermissionsToJSON(value?: ShockerPermissions | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'vibrate': value['vibrate'],
        'sound': value['sound'],
        'shock': value['shock'],
        'live': value['live'],
    };
}

