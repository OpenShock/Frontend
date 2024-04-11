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
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareLinkResponse
     */
    name?: string;
    /**
     * 
     * @type {Date}
     * @memberof ShareLinkResponse
     */
    createdOn?: Date;
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
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'createdOn': json['createdOn'] == null ? undefined : (new Date(json['createdOn'])),
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
        'createdOn': value['createdOn'] == null ? undefined : ((value['createdOn']).toISOString()),
        'expiresOn': value['expiresOn'] == null ? undefined : ((value['expiresOn'] as any).toISOString()),
    };
}

