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
 * @interface SharedShocker
 */
export interface SharedShocker {
    /**
     * 
     * @type {string}
     * @memberof SharedShocker
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof SharedShocker
     */
    name?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof SharedShocker
     */
    isPaused?: boolean;
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof SharedShocker
     */
    permissions?: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof SharedShocker
     */
    limits?: ShockerLimits;
}

/**
 * Check if a given object implements the SharedShocker interface.
 */
export function instanceOfSharedShocker(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function SharedShockerFromJSON(json: any): SharedShocker {
    return SharedShockerFromJSONTyped(json, false);
}

export function SharedShockerFromJSONTyped(json: any, ignoreDiscriminator: boolean): SharedShocker {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'isPaused': !exists(json, 'isPaused') ? undefined : json['isPaused'],
        'permissions': !exists(json, 'permissions') ? undefined : ShockerPermissionsFromJSON(json['permissions']),
        'limits': !exists(json, 'limits') ? undefined : ShockerLimitsFromJSON(json['limits']),
    };
}

export function SharedShockerToJSON(value?: SharedShocker | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'isPaused': value.isPaused,
        'permissions': ShockerPermissionsToJSON(value.permissions),
        'limits': ShockerLimitsToJSON(value.limits),
    };
}
