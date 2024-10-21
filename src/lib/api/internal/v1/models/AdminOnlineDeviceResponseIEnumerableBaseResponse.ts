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
import type { AdminOnlineDeviceResponse } from './AdminOnlineDeviceResponse';
import {
    AdminOnlineDeviceResponseFromJSON,
    AdminOnlineDeviceResponseFromJSONTyped,
    AdminOnlineDeviceResponseToJSON,
    AdminOnlineDeviceResponseToJSONTyped,
} from './AdminOnlineDeviceResponse';

/**
 * 
 * @export
 * @interface AdminOnlineDeviceResponseIEnumerableBaseResponse
 */
export interface AdminOnlineDeviceResponseIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof AdminOnlineDeviceResponseIEnumerableBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<AdminOnlineDeviceResponse>}
     * @memberof AdminOnlineDeviceResponseIEnumerableBaseResponse
     */
    data?: Array<AdminOnlineDeviceResponse> | null;
}

/**
 * Check if a given object implements the AdminOnlineDeviceResponseIEnumerableBaseResponse interface.
 */
export function instanceOfAdminOnlineDeviceResponseIEnumerableBaseResponse(value: object): value is AdminOnlineDeviceResponseIEnumerableBaseResponse {
    return true;
}

export function AdminOnlineDeviceResponseIEnumerableBaseResponseFromJSON(json: any): AdminOnlineDeviceResponseIEnumerableBaseResponse {
    return AdminOnlineDeviceResponseIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function AdminOnlineDeviceResponseIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AdminOnlineDeviceResponseIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ((json['data'] as Array<any>).map(AdminOnlineDeviceResponseFromJSON)),
    };
}

  export function AdminOnlineDeviceResponseIEnumerableBaseResponseToJSON(json: any): AdminOnlineDeviceResponseIEnumerableBaseResponse {
      return AdminOnlineDeviceResponseIEnumerableBaseResponseToJSONTyped(json, false);
  }

  export function AdminOnlineDeviceResponseIEnumerableBaseResponseToJSONTyped(value?: AdminOnlineDeviceResponseIEnumerableBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': value['data'] == null ? undefined : ((value['data'] as Array<any>).map(AdminOnlineDeviceResponseToJSON)),
    };
}

