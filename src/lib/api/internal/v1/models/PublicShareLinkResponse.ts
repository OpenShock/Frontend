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
import type { ShareLinkDevice } from './ShareLinkDevice';
import {
    ShareLinkDeviceFromJSON,
    ShareLinkDeviceFromJSONTyped,
    ShareLinkDeviceToJSON,
} from './ShareLinkDevice';

/**
 * 
 * @export
 * @interface PublicShareLinkResponse
 */
export interface PublicShareLinkResponse {
    /**
     * 
     * @type {string}
     * @memberof PublicShareLinkResponse
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof PublicShareLinkResponse
     */
    name?: string | null;
    /**
     * 
     * @type {Date}
     * @memberof PublicShareLinkResponse
     */
    createdOn?: Date;
    /**
     * 
     * @type {Date}
     * @memberof PublicShareLinkResponse
     */
    expiresOn?: Date | null;
    /**
     * 
     * @type {GenericIni}
     * @memberof PublicShareLinkResponse
     */
    author?: GenericIni;
    /**
     * 
     * @type {Array<ShareLinkDevice>}
     * @memberof PublicShareLinkResponse
     */
    devices?: Array<ShareLinkDevice> | null;
}

/**
 * Check if a given object implements the PublicShareLinkResponse interface.
 */
export function instanceOfPublicShareLinkResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function PublicShareLinkResponseFromJSON(json: any): PublicShareLinkResponse {
    return PublicShareLinkResponseFromJSONTyped(json, false);
}

export function PublicShareLinkResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PublicShareLinkResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'createdOn': !exists(json, 'createdOn') ? undefined : (new Date(json['createdOn'])),
        'expiresOn': !exists(json, 'expiresOn') ? undefined : (json['expiresOn'] === null ? null : new Date(json['expiresOn'])),
        'author': !exists(json, 'author') ? undefined : GenericIniFromJSON(json['author']),
        'devices': !exists(json, 'devices') ? undefined : (json['devices'] === null ? null : (json['devices'] as Array<any>).map(ShareLinkDeviceFromJSON)),
    };
}

export function PublicShareLinkResponseToJSON(value?: PublicShareLinkResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'createdOn': value.createdOn === undefined ? undefined : (value.createdOn.toISOString()),
        'expiresOn': value.expiresOn === undefined ? undefined : (value.expiresOn === null ? null : value.expiresOn.toISOString()),
        'author': GenericIniToJSON(value.author),
        'devices': value.devices === undefined ? undefined : (value.devices === null ? null : (value.devices as Array<any>).map(ShareLinkDeviceToJSON)),
    };
}
