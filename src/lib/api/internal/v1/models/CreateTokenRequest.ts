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
import type { PermissionType } from './PermissionType';
import {
    PermissionTypeFromJSON,
    PermissionTypeFromJSONTyped,
    PermissionTypeToJSON,
} from './PermissionType';

/**
 * 
 * @export
 * @interface CreateTokenRequest
 */
export interface CreateTokenRequest {
    /**
     * 
     * @type {string}
     * @memberof CreateTokenRequest
     */
    name: string | null;
    /**
     * 
     * @type {Array<PermissionType>}
     * @memberof CreateTokenRequest
     */
    permissions?: Array<PermissionType>;
    /**
     * 
     * @type {Date}
     * @memberof CreateTokenRequest
     */
    validUntil?: Date;
}

/**
 * Check if a given object implements the CreateTokenRequest interface.
 */
export function instanceOfCreateTokenRequest(value: object): value is CreateTokenRequest {
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function CreateTokenRequestFromJSON(json: any): CreateTokenRequest {
    return CreateTokenRequestFromJSONTyped(json, false);
}

export function CreateTokenRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateTokenRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'permissions': json['permissions'] == null ? undefined : ((json['permissions'] as Array<any>).map(PermissionTypeFromJSON)),
        'validUntil': json['validUntil'] == null ? undefined : (new Date(json['validUntil'])),
    };
}

export function CreateTokenRequestToJSON(value?: CreateTokenRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'permissions': value['permissions'] == null ? undefined : ((value['permissions'] as Array<any>).map(PermissionTypeToJSON)),
        'validUntil': value['validUntil'] == null ? undefined : ((value['validUntil'] as any).toISOString()),
    };
}

