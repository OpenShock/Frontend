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
import type { ShareLinkResponse } from './ShareLinkResponse';
import {
    ShareLinkResponseFromJSON,
    ShareLinkResponseFromJSONTyped,
    ShareLinkResponseToJSON,
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
export function instanceOfShareLinkResponseIEnumerableBaseResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ShareLinkResponseIEnumerableBaseResponseFromJSON(json: any): ShareLinkResponseIEnumerableBaseResponse {
    return ShareLinkResponseIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function ShareLinkResponseIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLinkResponseIEnumerableBaseResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'message': !exists(json, 'message') ? undefined : json['message'],
        'data': !exists(json, 'data') ? undefined : (json['data'] === null ? null : (json['data'] as Array<any>).map(ShareLinkResponseFromJSON)),
    };
}

export function ShareLinkResponseIEnumerableBaseResponseToJSON(value?: ShareLinkResponseIEnumerableBaseResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'message': value.message,
        'data': value.data === undefined ? undefined : (value.data === null ? null : (value.data as Array<any>).map(ShareLinkResponseToJSON)),
    };
}

