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
 * @interface PublicShareEditShocker
 */
export interface PublicShareEditShocker {
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof PublicShareEditShocker
     */
    permissions: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof PublicShareEditShocker
     */
    limits: ShockerLimits;
    /**
     * 
     * @type {number}
     * @memberof PublicShareEditShocker
     */
    cooldown?: number | null;
}

/**
 * Check if a given object implements the PublicShareEditShocker interface.
 */
export function instanceOfPublicShareEditShocker(value: object): value is PublicShareEditShocker {
    if (!('permissions' in value) || value['permissions'] === undefined) return false;
    if (!('limits' in value) || value['limits'] === undefined) return false;
    return true;
}

export function PublicShareEditShockerFromJSON(json: any): PublicShareEditShocker {
    return PublicShareEditShockerFromJSONTyped(json, false);
}

export function PublicShareEditShockerFromJSONTyped(json: any, ignoreDiscriminator: boolean): PublicShareEditShocker {
    if (json == null) {
        return json;
    }
    return {
        
        'permissions': ShockerPermissionsFromJSON(json['permissions']),
        'limits': ShockerLimitsFromJSON(json['limits']),
        'cooldown': json['cooldown'] == null ? undefined : json['cooldown'],
    };
}

export function PublicShareEditShockerToJSON(json: any): PublicShareEditShocker {
    return PublicShareEditShockerToJSONTyped(json, false);
}

export function PublicShareEditShockerToJSONTyped(value?: PublicShareEditShocker | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'permissions': ShockerPermissionsToJSON(value['permissions']),
        'limits': ShockerLimitsToJSON(value['limits']),
        'cooldown': value['cooldown'],
    };
}

