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
 * @interface PublicShareShocker
 */
export interface PublicShareShocker {
    /**
     * 
     * @type {string}
     * @memberof PublicShareShocker
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PublicShareShocker
     */
    name: string;
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof PublicShareShocker
     */
    permissions: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof PublicShareShocker
     */
    limits: ShockerLimits;
    /**
     * An integer representing the reason(s) for the shocker being paused, expressed as a bitfield where reasons are OR'd together.
     * 
     * Each bit corresponds to:
     * - 1: Shocker
     * - 2: UserShare
     * - 4: PublicShare
     * 
     * For example, a value of 6 (2 | 4) indicates both 'UserShare' and 'PublicShare' reasons.
     * @type {number}
     * @memberof PublicShareShocker
     */
    paused: number;
}

/**
 * Check if a given object implements the PublicShareShocker interface.
 */
export function instanceOfPublicShareShocker(value: object): value is PublicShareShocker {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('permissions' in value) || value['permissions'] === undefined) return false;
    if (!('limits' in value) || value['limits'] === undefined) return false;
    if (!('paused' in value) || value['paused'] === undefined) return false;
    return true;
}

export function PublicShareShockerFromJSON(json: any): PublicShareShocker {
    return PublicShareShockerFromJSONTyped(json, false);
}

export function PublicShareShockerFromJSONTyped(json: any, ignoreDiscriminator: boolean): PublicShareShocker {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'permissions': ShockerPermissionsFromJSON(json['permissions']),
        'limits': ShockerLimitsFromJSON(json['limits']),
        'paused': json['paused'],
    };
}

export function PublicShareShockerToJSON(json: any): PublicShareShocker {
    return PublicShareShockerToJSONTyped(json, false);
}

export function PublicShareShockerToJSONTyped(value?: PublicShareShocker | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'permissions': ShockerPermissionsToJSON(value['permissions']),
        'limits': ShockerLimitsToJSON(value['limits']),
        'paused': value['paused'],
    };
}

