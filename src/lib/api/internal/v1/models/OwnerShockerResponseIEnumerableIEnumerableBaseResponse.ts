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
import type { OwnerShockerResponse } from './OwnerShockerResponse';
import {
    OwnerShockerResponseFromJSON,
    OwnerShockerResponseFromJSONTyped,
    OwnerShockerResponseToJSON,
    OwnerShockerResponseToJSONTyped,
} from './OwnerShockerResponse';

/**
 * 
 * @export
 * @interface OwnerShockerResponseIEnumerableIEnumerableBaseResponse
 */
export interface OwnerShockerResponseIEnumerableIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof OwnerShockerResponseIEnumerableIEnumerableBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<Array<OwnerShockerResponse>>}
     * @memberof OwnerShockerResponseIEnumerableIEnumerableBaseResponse
     */
    data?: Array<Array<OwnerShockerResponse>> | null;
}

/**
 * Check if a given object implements the OwnerShockerResponseIEnumerableIEnumerableBaseResponse interface.
 */
export function instanceOfOwnerShockerResponseIEnumerableIEnumerableBaseResponse(value: object): value is OwnerShockerResponseIEnumerableIEnumerableBaseResponse {
    return true;
}

export function OwnerShockerResponseIEnumerableIEnumerableBaseResponseFromJSON(json: any): OwnerShockerResponseIEnumerableIEnumerableBaseResponse {
    return OwnerShockerResponseIEnumerableIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function OwnerShockerResponseIEnumerableIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): OwnerShockerResponseIEnumerableIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : json['data'],
    };
}

  export function OwnerShockerResponseIEnumerableIEnumerableBaseResponseToJSON(json: any): OwnerShockerResponseIEnumerableIEnumerableBaseResponse {
      return OwnerShockerResponseIEnumerableIEnumerableBaseResponseToJSONTyped(json, false);
  }

  export function OwnerShockerResponseIEnumerableIEnumerableBaseResponseToJSONTyped(value?: OwnerShockerResponseIEnumerableIEnumerableBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': value['data'],
    };
}

