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
import type { ShockerPermissions } from './ShockerPermissions';
import {
    ShockerPermissionsFromJSON,
    ShockerPermissionsFromJSONTyped,
    ShockerPermissionsToJSON,
    ShockerPermissionsToJSONTyped,
} from './ShockerPermissions';
import type { ShockerLimits } from './ShockerLimits';
import {
    ShockerLimitsFromJSON,
    ShockerLimitsFromJSONTyped,
    ShockerLimitsToJSON,
    ShockerLimitsToJSONTyped,
} from './ShockerLimits';

/**
 * 
 * @export
 * @interface ShockerPermLimitPairWithId
 */
export interface ShockerPermLimitPairWithId {
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof ShockerPermLimitPairWithId
     */
    permissions: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof ShockerPermLimitPairWithId
     */
    limits: ShockerLimits;
    /**
     * 
     * @type {string}
     * @memberof ShockerPermLimitPairWithId
     */
    id?: string;
}

/**
 * Check if a given object implements the ShockerPermLimitPairWithId interface.
 */
export function instanceOfShockerPermLimitPairWithId(value: object): value is ShockerPermLimitPairWithId {
    if (!('permissions' in value) || value['permissions'] === undefined) return false;
    if (!('limits' in value) || value['limits'] === undefined) return false;
    return true;
}

export function ShockerPermLimitPairWithIdFromJSON(json: any): ShockerPermLimitPairWithId {
    return ShockerPermLimitPairWithIdFromJSONTyped(json, false);
}

export function ShockerPermLimitPairWithIdFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShockerPermLimitPairWithId {
    if (json == null) {
        return json;
    }
    return {
        
        'permissions': ShockerPermissionsFromJSON(json['permissions']),
        'limits': ShockerLimitsFromJSON(json['limits']),
        'id': json['id'] == null ? undefined : json['id'],
    };
}

export function ShockerPermLimitPairWithIdToJSON(json: any): ShockerPermLimitPairWithId {
    return ShockerPermLimitPairWithIdToJSONTyped(json, false);
}

export function ShockerPermLimitPairWithIdToJSONTyped(value?: ShockerPermLimitPairWithId | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'permissions': ShockerPermissionsToJSON(value['permissions']),
        'limits': ShockerLimitsToJSON(value['limits']),
        'id': value['id'],
    };
}

