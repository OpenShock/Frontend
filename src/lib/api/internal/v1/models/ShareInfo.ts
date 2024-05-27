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
} from './ShockerPermissions';
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
    sharedWith: GenericIni;
    /**
     * 
     * @type {Date}
     * @memberof ShareInfo
     */
    createdOn: Date;
    /**
     * 
     * @type {ShockerPermissions}
     * @memberof ShareInfo
     */
    permissions: ShockerPermissions;
    /**
     * 
     * @type {ShockerLimits}
     * @memberof ShareInfo
     */
    limits: ShockerLimits;
    /**
     * 
     * @type {boolean}
     * @memberof ShareInfo
     */
    paused: boolean;
}

/**
 * Check if a given object implements the ShareInfo interface.
 */
export function instanceOfShareInfo(value: object): value is ShareInfo {
    if (!('sharedWith' in value) || value['sharedWith'] === undefined) return false;
    if (!('createdOn' in value) || value['createdOn'] === undefined) return false;
    if (!('permissions' in value) || value['permissions'] === undefined) return false;
    if (!('limits' in value) || value['limits'] === undefined) return false;
    if (!('paused' in value) || value['paused'] === undefined) return false;
    return true;
}

export function ShareInfoFromJSON(json: any): ShareInfo {
    return ShareInfoFromJSONTyped(json, false);
}

export function ShareInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareInfo {
    if (json == null) {
        return json;
    }
    return {
        
        'sharedWith': GenericIniFromJSON(json['sharedWith']),
        'createdOn': (new Date(json['createdOn'])),
        'permissions': ShockerPermissionsFromJSON(json['permissions']),
        'limits': ShockerLimitsFromJSON(json['limits']),
        'paused': json['paused'],
    };
}

export function ShareInfoToJSON(value?: ShareInfo | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'sharedWith': GenericIniToJSON(value['sharedWith']),
        'createdOn': ((value['createdOn']).toISOString()),
        'permissions': ShockerPermissionsToJSON(value['permissions']),
        'limits': ShockerLimitsToJSON(value['limits']),
        'paused': value['paused'],
    };
}

