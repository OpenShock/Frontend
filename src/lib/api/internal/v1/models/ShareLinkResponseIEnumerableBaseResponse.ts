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
import type { ShareLinkResponse } from './ShareLinkResponse';
import {
    ShareLinkResponseFromJSON,
    ShareLinkResponseFromJSONTyped,
    ShareLinkResponseToJSON,
    ShareLinkResponseToJSONTyped,
} from './ShareLinkResponse';

/**
 * 
 * @export
 * @interface ShareLinkResponseIEnumerableBaseResponse
 */
export interface ShareLinkResponseIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ShareLinkResponseIEnumerableBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<ShareLinkResponse>}
     * @memberof ShareLinkResponseIEnumerableBaseResponse
     */
    data?: Array<ShareLinkResponse> | null;
}

/**
 * Check if a given object implements the ShareLinkResponseIEnumerableBaseResponse interface.
 */
export function instanceOfShareLinkResponseIEnumerableBaseResponse(value: object): value is ShareLinkResponseIEnumerableBaseResponse {
    return true;
}

export function ShareLinkResponseIEnumerableBaseResponseFromJSON(json: any): ShareLinkResponseIEnumerableBaseResponse {
    return ShareLinkResponseIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function ShareLinkResponseIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLinkResponseIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ((json['data'] as Array<any>).map(ShareLinkResponseFromJSON)),
    };
}

export function ShareLinkResponseIEnumerableBaseResponseToJSON(json: any): ShareLinkResponseIEnumerableBaseResponse {
    return ShareLinkResponseIEnumerableBaseResponseToJSONTyped(json, false);
}

export function ShareLinkResponseIEnumerableBaseResponseToJSONTyped(value?: ShareLinkResponseIEnumerableBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': value['data'] == null ? undefined : ((value['data'] as Array<any>).map(ShareLinkResponseToJSON)),
    };
}

