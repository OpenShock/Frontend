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
import type { GenericIni } from './GenericIni';
import {
    GenericIniFromJSON,
    GenericIniFromJSONTyped,
    GenericIniToJSON,
} from './GenericIni';
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
 * @interface ShareInfo
 */
export interface ShareInfo {
    /**
     * 
     * @type {GenericIni}
     * @memberof ShareInfo
     */
    sharedWith?: GenericIni;
    /**
     * 
     * @type {Date}
     * @memberof ShareInfo
     */
    createdOn?: Date;
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof ShareInfo
     */
    permissions?: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof ShareInfo
     */
    limits?: ShockerLimits;
    /**
     * 
     * @type {boolean}
     * @memberof ShareInfo
     */
    paused?: boolean;
}

/**
 * Check if a given object implements the ShareInfo interface.
 */
export function instanceOfShareInfo(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ShareInfoFromJSON(json: any): ShareInfo {
    return ShareInfoFromJSONTyped(json, false);
}

export function ShareInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareInfo {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'sharedWith': !exists(json, 'sharedWith') ? undefined : GenericIniFromJSON(json['sharedWith']),
        'createdOn': !exists(json, 'createdOn') ? undefined : (new Date(json['createdOn'])),
        'permissions': !exists(json, 'permissions') ? undefined : ShockerPermissionsFromJSON(json['permissions']),
        'limits': !exists(json, 'limits') ? undefined : ShockerLimitsFromJSON(json['limits']),
        'paused': !exists(json, 'paused') ? undefined : json['paused'],
    };
}

export function ShareInfoToJSON(value?: ShareInfo | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'sharedWith': GenericIniToJSON(value.sharedWith),
        'createdOn': value.createdOn === undefined ? undefined : (value.createdOn.toISOString()),
        'permissions': ShockerPermissionsToJSON(value.permissions),
        'limits': ShockerLimitsToJSON(value.limits),
        'paused': value.paused,
    };
}

