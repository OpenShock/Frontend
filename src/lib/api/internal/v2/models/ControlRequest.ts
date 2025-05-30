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
import type { Control } from './Control';
import {
    ControlFromJSON,
    ControlFromJSONTyped,
    ControlToJSON,
    ControlToJSONTyped,
} from './Control';

/**
 * 
 * @export
 * @interface ControlRequest
 */
export interface ControlRequest {
    /**
     * 
     * @type {Array<Control>}
     * @memberof ControlRequest
     */
    shocks: Array<Control>;
    /**
     * 
     * @type {string}
     * @memberof ControlRequest
     */
    customName?: string | null;
}

/**
 * Check if a given object implements the ControlRequest interface.
 */
export function instanceOfControlRequest(value: object): value is ControlRequest {
    if (!('shocks' in value) || value['shocks'] === undefined) return false;
    return true;
}

export function ControlRequestFromJSON(json: any): ControlRequest {
    return ControlRequestFromJSONTyped(json, false);
}

export function ControlRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ControlRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'shocks': ((json['shocks'] as Array<any>).map(ControlFromJSON)),
        'customName': json['customName'] == null ? undefined : json['customName'],
    };
}

export function ControlRequestToJSON(json: any): ControlRequest {
    return ControlRequestToJSONTyped(json, false);
}

export function ControlRequestToJSONTyped(value?: ControlRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'shocks': ((value['shocks'] as Array<any>).map(ControlToJSON)),
        'customName': value['customName'],
    };
}

