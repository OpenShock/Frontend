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
import type { ShareCodeInfo } from './ShareCodeInfo';
import {
    ShareCodeInfoFromJSON,
    ShareCodeInfoFromJSONTyped,
    ShareCodeInfoToJSON,
} from './ShareCodeInfo';

/**
 * 
 * @export
 * @interface ShareCodeInfoIEnumerableBaseResponse
 */
export interface ShareCodeInfoIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ShareCodeInfoIEnumerableBaseResponse
     */
    message?: string;
    /**
     * 
     * @type {Array<ShareCodeInfo>}
     * @memberof ShareCodeInfoIEnumerableBaseResponse
     */
    data?: Array<ShareCodeInfo>;
}

/**
 * Check if a given object implements the ShareCodeInfoIEnumerableBaseResponse interface.
 */
export function instanceOfShareCodeInfoIEnumerableBaseResponse(value: object): boolean {
    return true;
}

export function ShareCodeInfoIEnumerableBaseResponseFromJSON(json: any): ShareCodeInfoIEnumerableBaseResponse {
    return ShareCodeInfoIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function ShareCodeInfoIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareCodeInfoIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ((json['data'] as Array<any>).map(ShareCodeInfoFromJSON)),
    };
}

export function ShareCodeInfoIEnumerableBaseResponseToJSON(value?: ShareCodeInfoIEnumerableBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': value['data'] == null ? undefined : ((value['data'] as Array<any>).map(ShareCodeInfoToJSON)),
    };
}

