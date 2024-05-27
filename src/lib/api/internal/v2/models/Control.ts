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
import type { ControlType } from './ControlType';
import {
    ControlTypeFromJSON,
    ControlTypeFromJSONTyped,
    ControlTypeToJSON,
} from './ControlType';

/**
 * 
 * @export
 * @interface Control
 */
export interface Control {
    /**
     * 
     * @type {string}
     * @memberof Control
     */
    id: string;
    /**
     * 
     * @type {ControlType}
     * @memberof Control
     */
    type: ControlType;
    /**
     * 
     * @type {number}
     * @memberof Control
     */
    intensity: number;
    /**
     * 
     * @type {number}
     * @memberof Control
     */
    duration: number;
    /**
     * 
     * @type {boolean}
     * @memberof Control
     */
    exclusive?: boolean;
}

/**
 * Check if a given object implements the Control interface.
 */
export function instanceOfControl(value: object): boolean {
    if (!('id' in value)) return false;
    if (!('type' in value)) return false;
    if (!('intensity' in value)) return false;
    if (!('duration' in value)) return false;
    return true;
}

export function ControlFromJSON(json: any): Control {
    return ControlFromJSONTyped(json, false);
}

export function ControlFromJSONTyped(json: any, ignoreDiscriminator: boolean): Control {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'type': ControlTypeFromJSON(json['type']),
        'intensity': json['intensity'],
        'duration': json['duration'],
        'exclusive': json['exclusive'] == null ? undefined : json['exclusive'],
    };
}

export function ControlToJSON(value?: Control | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'type': ControlTypeToJSON(value['type']),
        'intensity': value['intensity'],
        'duration': value['duration'],
        'exclusive': value['exclusive'],
    };
}

