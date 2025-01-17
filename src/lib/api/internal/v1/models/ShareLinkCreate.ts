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
/**
 * 
 * @export
 * @interface ShareLinkCreate
 */
export interface ShareLinkCreate {
    /**
     * 
     * @type {string}
     * @memberof ShareLinkCreate
     */
    name: string;
    /**
     * 
     * @type {Date}
     * @memberof ShareLinkCreate
     */
    expiresOn?: Date | null;
}

/**
 * Check if a given object implements the ShareLinkCreate interface.
 */
export function instanceOfShareLinkCreate(value: object): value is ShareLinkCreate {
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function ShareLinkCreateFromJSON(json: any): ShareLinkCreate {
    return ShareLinkCreateFromJSONTyped(json, false);
}

export function ShareLinkCreateFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLinkCreate {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'expiresOn': json['expiresOn'] == null ? undefined : (new Date(json['expiresOn'])),
    };
}

export function ShareLinkCreateToJSON(json: any): ShareLinkCreate {
    return ShareLinkCreateToJSONTyped(json, false);
}

export function ShareLinkCreateToJSONTyped(value?: ShareLinkCreate | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'expiresOn': value['expiresOn'] == null ? undefined : ((value['expiresOn'] as any).toISOString()),
    };
}

