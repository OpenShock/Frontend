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
import type { ShareLinkShocker } from './ShareLinkShocker';
import {
    ShareLinkShockerFromJSON,
    ShareLinkShockerFromJSONTyped,
    ShareLinkShockerToJSON,
} from './ShareLinkShocker';

/**
 * 
 * @export
 * @interface ShareLinkDevice
 */
export interface ShareLinkDevice {
    /**
     * 
     * @type {string}
     * @memberof ShareLinkDevice
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ShareLinkDevice
     */
    name: string | null;
    /**
     * 
     * @type {Array<ShareLinkShocker>}
     * @memberof ShareLinkDevice
     */
    shockers?: Array<ShareLinkShocker> | null;
}

/**
 * Check if a given object implements the ShareLinkDevice interface.
 */
export function instanceOfShareLinkDevice(value: object): value is ShareLinkDevice {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function ShareLinkDeviceFromJSON(json: any): ShareLinkDevice {
    return ShareLinkDeviceFromJSONTyped(json, false);
}

export function ShareLinkDeviceFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLinkDevice {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'shockers': json['shockers'] == null ? undefined : ((json['shockers'] as Array<any>).map(ShareLinkShockerFromJSON)),
    };
}

export function ShareLinkDeviceToJSON(value?: ShareLinkDevice | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'shockers': value['shockers'] == null ? undefined : ((value['shockers'] as Array<any>).map(ShareLinkShockerToJSON)),
    };
}

