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
import type { ShockerResponse } from './ShockerResponse';
import {
    ShockerResponseFromJSON,
    ShockerResponseFromJSONTyped,
    ShockerResponseToJSON,
    ShockerResponseToJSONTyped,
} from './ShockerResponse';

/**
 * 
 * @export
 * @interface ShockerResponseIEnumerableBaseResponse
 */
export interface ShockerResponseIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ShockerResponseIEnumerableBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<ShockerResponse>}
     * @memberof ShockerResponseIEnumerableBaseResponse
     */
    data?: Array<ShockerResponse> | null;
}

/**
 * Check if a given object implements the ShockerResponseIEnumerableBaseResponse interface.
 */
export function instanceOfShockerResponseIEnumerableBaseResponse(value: object): value is ShockerResponseIEnumerableBaseResponse {
    return true;
}

export function ShockerResponseIEnumerableBaseResponseFromJSON(json: any): ShockerResponseIEnumerableBaseResponse {
    return ShockerResponseIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function ShockerResponseIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShockerResponseIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ((json['data'] as Array<any>).map(ShockerResponseFromJSON)),
    };
}

  export function ShockerResponseIEnumerableBaseResponseToJSON(json: any): ShockerResponseIEnumerableBaseResponse {
      return ShockerResponseIEnumerableBaseResponseToJSONTyped(json, false);
  }

  export function ShockerResponseIEnumerableBaseResponseToJSONTyped(value?: ShockerResponseIEnumerableBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': value['data'] == null ? undefined : ((value['data'] as Array<any>).map(ShockerResponseToJSON)),
    };
}

