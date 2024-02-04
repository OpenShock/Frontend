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
import type { MinimalShocker } from './MinimalShocker';
import {
    MinimalShockerFromJSON,
    MinimalShockerFromJSONTyped,
    MinimalShockerToJSON,
} from './MinimalShocker';

/**
 * 
 * @export
 * @interface DeviceSelfResponse
 */
export interface DeviceSelfResponse {
    /**
     * 
     * @type {string}
     * @memberof DeviceSelfResponse
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof DeviceSelfResponse
     */
    name?: string | null;
    /**
     * 
     * @type {Array<MinimalShocker>}
     * @memberof DeviceSelfResponse
     */
    shockers?: Array<MinimalShocker> | null;
}

/**
 * Check if a given object implements the DeviceSelfResponse interface.
 */
export function instanceOfDeviceSelfResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function DeviceSelfResponseFromJSON(json: any): DeviceSelfResponse {
    return DeviceSelfResponseFromJSONTyped(json, false);
}

export function DeviceSelfResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeviceSelfResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'shockers': !exists(json, 'shockers') ? undefined : (json['shockers'] === null ? null : (json['shockers'] as Array<any>).map(MinimalShockerFromJSON)),
    };
}

export function DeviceSelfResponseToJSON(value?: DeviceSelfResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'shockers': value.shockers === undefined ? undefined : (value.shockers === null ? null : (value.shockers as Array<any>).map(MinimalShockerToJSON)),
    };
}

