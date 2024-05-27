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
import type { ShockerLimits } from './ShockerLimits';
import {
    ShockerLimitsFromJSON,
    ShockerLimitsFromJSONTyped,
    ShockerLimitsToJSON,
} from './ShockerLimits';
import type { ShockerPermissions } from './ShockerPermissions';
import {
    ShockerPermissionsFromJSON,
    ShockerPermissionsFromJSONTyped,
    ShockerPermissionsToJSON,
} from './ShockerPermissions';

/**
 * 
 * @export
 * @interface CreateShareCode
 */
export interface CreateShareCode {
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof CreateShareCode
     */
    permissions: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof CreateShareCode
     */
    limits: ShockerLimits;
}

/**
 * Check if a given object implements the CreateShareCode interface.
 */
export function instanceOfCreateShareCode(value: object): boolean {
    if (!('permissions' in value)) return false;
    if (!('limits' in value)) return false;
    return true;
}

export function CreateShareCodeFromJSON(json: any): CreateShareCode {
    return CreateShareCodeFromJSONTyped(json, false);
}

export function CreateShareCodeFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateShareCode {
    if (json == null) {
        return json;
    }
    return {
        
        'permissions': ShockerPermissionsFromJSON(json['permissions']),
        'limits': ShockerLimitsFromJSON(json['limits']),
    };
}

export function CreateShareCodeToJSON(value?: CreateShareCode | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'permissions': ShockerPermissionsToJSON(value['permissions']),
        'limits': ShockerLimitsToJSON(value['limits']),
    };
}

