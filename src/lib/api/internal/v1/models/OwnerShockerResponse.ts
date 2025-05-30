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
import type { SharedDevice } from './SharedDevice';
import {
    SharedDeviceFromJSON,
    SharedDeviceFromJSONTyped,
    SharedDeviceToJSON,
    SharedDeviceToJSONTyped,
} from './SharedDevice';

/**
 * 
 * @export
 * @interface OwnerShockerResponse
 */
export interface OwnerShockerResponse {
    /**
     * 
     * @type {string}
     * @memberof OwnerShockerResponse
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof OwnerShockerResponse
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof OwnerShockerResponse
     */
    image: string;
    /**
     * 
     * @type {Array<SharedDevice>}
     * @memberof OwnerShockerResponse
     */
    devices: Array<SharedDevice>;
}

/**
 * Check if a given object implements the OwnerShockerResponse interface.
 */
export function instanceOfOwnerShockerResponse(value: object): value is OwnerShockerResponse {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('image' in value) || value['image'] === undefined) return false;
    if (!('devices' in value) || value['devices'] === undefined) return false;
    return true;
}

export function OwnerShockerResponseFromJSON(json: any): OwnerShockerResponse {
    return OwnerShockerResponseFromJSONTyped(json, false);
}

export function OwnerShockerResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): OwnerShockerResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'image': json['image'],
        'devices': ((json['devices'] as Array<any>).map(SharedDeviceFromJSON)),
    };
}

export function OwnerShockerResponseToJSON(json: any): OwnerShockerResponse {
    return OwnerShockerResponseToJSONTyped(json, false);
}

export function OwnerShockerResponseToJSONTyped(value?: OwnerShockerResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'image': value['image'],
        'devices': ((value['devices'] as Array<any>).map(SharedDeviceToJSON)),
    };
}

