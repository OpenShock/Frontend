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
import type { ShareRequestCounts } from './ShareRequestCounts';
import {
    ShareRequestCountsFromJSON,
    ShareRequestCountsFromJSONTyped,
    ShareRequestCountsToJSON,
    ShareRequestCountsToJSONTyped,
} from './ShareRequestCounts';
import type { GenericIni } from './GenericIni';
import {
    GenericIniFromJSON,
    GenericIniFromJSONTyped,
    GenericIniToJSON,
    GenericIniToJSONTyped,
} from './GenericIni';

/**
 * 
 * @export
 * @interface ShareRequestBaseItem
 */
export interface ShareRequestBaseItem {
    /**
     * 
     * @type {string}
     * @memberof ShareRequestBaseItem
     */
    id: string;
    /**
     * 
     * @type {Date}
     * @memberof ShareRequestBaseItem
     */
    createdOn: Date;
    /**
     * 
     * @type {GenericIni}
     * @memberof ShareRequestBaseItem
     */
    owner: GenericIni;
    /**
     * 
     * @type {GenericIni}
     * @memberof ShareRequestBaseItem
     */
    sharedWith: GenericIni;
    /**
     * 
     * @type {ShareRequestCounts}
     * @memberof ShareRequestBaseItem
     */
    counts: ShareRequestCounts;
}

/**
 * Check if a given object implements the ShareRequestBaseItem interface.
 */
export function instanceOfShareRequestBaseItem(value: object): value is ShareRequestBaseItem {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('createdOn' in value) || value['createdOn'] === undefined) return false;
    if (!('owner' in value) || value['owner'] === undefined) return false;
    if (!('sharedWith' in value) || value['sharedWith'] === undefined) return false;
    if (!('counts' in value) || value['counts'] === undefined) return false;
    return true;
}

export function ShareRequestBaseItemFromJSON(json: any): ShareRequestBaseItem {
    return ShareRequestBaseItemFromJSONTyped(json, false);
}

export function ShareRequestBaseItemFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareRequestBaseItem {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'createdOn': (new Date(json['createdOn'])),
        'owner': GenericIniFromJSON(json['owner']),
        'sharedWith': GenericIniFromJSON(json['sharedWith']),
        'counts': ShareRequestCountsFromJSON(json['counts']),
    };
}

export function ShareRequestBaseItemToJSON(json: any): ShareRequestBaseItem {
    return ShareRequestBaseItemToJSONTyped(json, false);
}

export function ShareRequestBaseItemToJSONTyped(value?: ShareRequestBaseItem | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'createdOn': ((value['createdOn']).toISOString()),
        'owner': GenericIniToJSON(value['owner']),
        'sharedWith': GenericIniToJSON(value['sharedWith']),
        'counts': ShareRequestCountsToJSON(value['counts']),
    };
}

