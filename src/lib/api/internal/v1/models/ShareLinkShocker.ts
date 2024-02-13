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
import type { PauseReason } from './PauseReason';
import {
    PauseReasonFromJSON,
    PauseReasonFromJSONTyped,
    PauseReasonToJSON,
} from './PauseReason';
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
 * @interface ShareLinkShocker
 */
export interface ShareLinkShocker {
    /**
     * 
     * @type {string}
     * @memberof ShareLinkShocker
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareLinkShocker
     */
    name?: string | null;
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof ShareLinkShocker
     */
    permissions?: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof ShareLinkShocker
     */
    limits?: ShockerLimits;
    /**
     * 
     * @type {PauseReason}
     * @memberof ShareLinkShocker
     */
    paused?: PauseReason;
}

/**
 * Check if a given object implements the ShareLinkShocker interface.
 */
export function instanceOfShareLinkShocker(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ShareLinkShockerFromJSON(json: any): ShareLinkShocker {
    return ShareLinkShockerFromJSONTyped(json, false);
}

export function ShareLinkShockerFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLinkShocker {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'permissions': !exists(json, 'permissions') ? undefined : ShockerPermissionsFromJSON(json['permissions']),
        'limits': !exists(json, 'limits') ? undefined : ShockerLimitsFromJSON(json['limits']),
        'paused': !exists(json, 'paused') ? undefined : PauseReasonFromJSON(json['paused']),
    };
}

export function ShareLinkShockerToJSON(value?: ShareLinkShocker | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'permissions': ShockerPermissionsToJSON(value.permissions),
        'limits': ShockerLimitsToJSON(value.limits),
        'paused': PauseReasonToJSON(value.paused),
    };
}
