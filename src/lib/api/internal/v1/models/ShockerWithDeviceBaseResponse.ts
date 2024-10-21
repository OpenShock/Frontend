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
import type { ShockerWithDevice } from './ShockerWithDevice';
import {
    ShockerWithDeviceFromJSON,
    ShockerWithDeviceFromJSONTyped,
    ShockerWithDeviceToJSON,
    ShockerWithDeviceToJSONTyped,
} from './ShockerWithDevice';

/**
 * 
 * @export
 * @interface ShockerWithDeviceBaseResponse
 */
export interface ShockerWithDeviceBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ShockerWithDeviceBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {ShockerWithDevice}
     * @memberof ShockerWithDeviceBaseResponse
     */
    data?: ShockerWithDevice;
}

/**
 * Check if a given object implements the ShockerWithDeviceBaseResponse interface.
 */
export function instanceOfShockerWithDeviceBaseResponse(value: object): value is ShockerWithDeviceBaseResponse {
    return true;
}

export function ShockerWithDeviceBaseResponseFromJSON(json: any): ShockerWithDeviceBaseResponse {
    return ShockerWithDeviceBaseResponseFromJSONTyped(json, false);
}

export function ShockerWithDeviceBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShockerWithDeviceBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ShockerWithDeviceFromJSON(json['data']),
    };
}

  export function ShockerWithDeviceBaseResponseToJSON(json: any): ShockerWithDeviceBaseResponse {
      return ShockerWithDeviceBaseResponseToJSONTyped(json, false);
  }

  export function ShockerWithDeviceBaseResponseToJSONTyped(value?: ShockerWithDeviceBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': ShockerWithDeviceToJSON(value['data']),
    };
}

