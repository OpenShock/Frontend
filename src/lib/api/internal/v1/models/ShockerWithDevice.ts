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
import type { ShockerModelType } from './ShockerModelType';
import {
    ShockerModelTypeFromJSON,
    ShockerModelTypeFromJSONTyped,
    ShockerModelTypeToJSON,
} from './ShockerModelType';

/**
 * 
 * @export
 * @interface ShockerWithDevice
 */
export interface ShockerWithDevice {
    /**
     * 
     * @type {string}
     * @memberof ShockerWithDevice
     */
    id?: string;
    /**
     * 
     * @type {number}
     * @memberof ShockerWithDevice
     */
    rfId?: number;
    /**
     * 
     * @type {ShockerModelType}
     * @memberof ShockerWithDevice
     */
    model?: ShockerModelType;
    /**
     * 
     * @type {string}
     * @memberof ShockerWithDevice
     */
    name?: string;
    /**
     * 
     * @type {boolean}
     * @memberof ShockerWithDevice
     */
    isPaused?: boolean;
    /**
     * 
     * @type {Date}
     * @memberof ShockerWithDevice
     */
    createdOn?: Date;
    /**
     * 
     * @type {string}
     * @memberof ShockerWithDevice
     */
    device?: string;
}

/**
 * Check if a given object implements the ShockerWithDevice interface.
 */
export function instanceOfShockerWithDevice(value: object): boolean {
    return true;
}

export function ShockerWithDeviceFromJSON(json: any): ShockerWithDevice {
    return ShockerWithDeviceFromJSONTyped(json, false);
}

export function ShockerWithDeviceFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShockerWithDevice {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'rfId': json['rfId'] == null ? undefined : json['rfId'],
        'model': json['model'] == null ? undefined : ShockerModelTypeFromJSON(json['model']),
        'name': json['name'] == null ? undefined : json['name'],
        'isPaused': json['isPaused'] == null ? undefined : json['isPaused'],
        'createdOn': json['createdOn'] == null ? undefined : (new Date(json['createdOn'])),
        'device': json['device'] == null ? undefined : json['device'],
    };
}

export function ShockerWithDeviceToJSON(value?: ShockerWithDevice | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'rfId': value['rfId'],
        'model': ShockerModelTypeToJSON(value['model']),
        'name': value['name'],
        'isPaused': value['isPaused'],
        'createdOn': value['createdOn'] == null ? undefined : ((value['createdOn']).toISOString()),
        'device': value['device'],
    };
}

