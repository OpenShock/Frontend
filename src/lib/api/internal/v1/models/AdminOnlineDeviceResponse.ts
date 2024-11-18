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
 * @interface AdminOnlineDeviceResponse
 */
export interface AdminOnlineDeviceResponse {
    /**
     * 
     * @type {string}
     * @memberof AdminOnlineDeviceResponse
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminOnlineDeviceResponse
     */
    name: string;
    /**
     * 
     * @type {GenericIni}
     * @memberof AdminOnlineDeviceResponse
     */
    owner: GenericIni;
    /**
     * 
     * @type {string}
     * @memberof AdminOnlineDeviceResponse
     */
    firmwareVersion: string;
    /**
     * 
     * @type {string}
     * @memberof AdminOnlineDeviceResponse
     */
    gateway: string;
    /**
     * 
     * @type {Date}
     * @memberof AdminOnlineDeviceResponse
     */
    connectedAt: Date;
    /**
     * 
     * @type {string}
     * @memberof AdminOnlineDeviceResponse
     */
    userAgent: string | null;
    /**
     * 
     * @type {Date}
     * @memberof AdminOnlineDeviceResponse
     */
    bootedAt: Date;
    /**
     * 
     * @type {number}
     * @memberof AdminOnlineDeviceResponse
     */
    latencyMs: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdminOnlineDeviceResponse
     */
    rssi: number | null;
}

/**
 * Check if a given object implements the AdminOnlineDeviceResponse interface.
 */
export function instanceOfAdminOnlineDeviceResponse(value: object): value is AdminOnlineDeviceResponse {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('owner' in value) || value['owner'] === undefined) return false;
    if (!('firmwareVersion' in value) || value['firmwareVersion'] === undefined) return false;
    if (!('gateway' in value) || value['gateway'] === undefined) return false;
    if (!('connectedAt' in value) || value['connectedAt'] === undefined) return false;
    if (!('userAgent' in value) || value['userAgent'] === undefined) return false;
    if (!('bootedAt' in value) || value['bootedAt'] === undefined) return false;
    if (!('latencyMs' in value) || value['latencyMs'] === undefined) return false;
    if (!('rssi' in value) || value['rssi'] === undefined) return false;
    return true;
}

export function AdminOnlineDeviceResponseFromJSON(json: any): AdminOnlineDeviceResponse {
    return AdminOnlineDeviceResponseFromJSONTyped(json, false);
}

export function AdminOnlineDeviceResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AdminOnlineDeviceResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'owner': GenericIniFromJSON(json['owner']),
        'firmwareVersion': json['firmwareVersion'],
        'gateway': json['gateway'],
        'connectedAt': (new Date(json['connectedAt'])),
        'userAgent': json['userAgent'],
        'bootedAt': (new Date(json['bootedAt'])),
        'latencyMs': json['latencyMs'],
        'rssi': json['rssi'],
    };
}

  export function AdminOnlineDeviceResponseToJSON(json: any): AdminOnlineDeviceResponse {
      return AdminOnlineDeviceResponseToJSONTyped(json, false);
  }

  export function AdminOnlineDeviceResponseToJSONTyped(value?: AdminOnlineDeviceResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'owner': GenericIniToJSON(value['owner']),
        'firmwareVersion': value['firmwareVersion'],
        'gateway': value['gateway'],
        'connectedAt': ((value['connectedAt']).toISOString()),
        'userAgent': value['userAgent'],
        'bootedAt': ((value['bootedAt']).toISOString()),
        'latencyMs': value['latencyMs'],
        'rssi': value['rssi'],
    };
}

