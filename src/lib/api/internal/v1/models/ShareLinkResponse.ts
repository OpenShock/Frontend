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
 * @interface ShareLinkResponse
 */
export interface ShareLinkResponse {
    /**
     * 
     * @type {string}
     * @memberof ShareLinkResponse
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ShareLinkResponse
     */
    name: string | null;
    /**
     * 
     * @type {Date}
     * @memberof ShareLinkResponse
     */
    createdOn: Date;
    /**
     * 
     * @type {Date}
     * @memberof ShareLinkResponse
     */
    expiresOn?: Date;
}

/**
 * Check if a given object implements the ShareLinkResponse interface.
 */
export function instanceOfShareLinkResponse(value: object): boolean {
    if (!('id' in value)) return false;
    if (!('name' in value)) return false;
    if (!('createdOn' in value)) return false;
    return true;
}

export function ShareLinkResponseFromJSON(json: any): ShareLinkResponse {
    return ShareLinkResponseFromJSONTyped(json, false);
}

export function ShareLinkResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLinkResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'createdOn': (new Date(json['createdOn'])),
        'expiresOn': json['expiresOn'] == null ? undefined : (new Date(json['expiresOn'])),
    };
}

export function ShareLinkResponseToJSON(value?: ShareLinkResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'createdOn': ((value['createdOn']).toISOString()),
        'expiresOn': value['expiresOn'] == null ? undefined : ((value['expiresOn'] as any).toISOString()),
    };
}

