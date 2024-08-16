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
} from './ShareLinkResponse';

/**
 * 
 * @export
 * @interface ShareLinkResponseBaseResponse
 */
export interface ShareLinkResponseBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof ShareLinkResponseBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {ShareLinkResponse}
     * @memberof ShareLinkResponseBaseResponse
     */
    data?: ShareLinkResponse;
}

/**
 * Check if a given object implements the ShareLinkResponseBaseResponse interface.
 */
export function instanceOfShareLinkResponseBaseResponse(value: object): value is ShareLinkResponseBaseResponse {
    return true;
}

export function ShareLinkResponseBaseResponseFromJSON(json: any): ShareLinkResponseBaseResponse {
    return ShareLinkResponseBaseResponseFromJSONTyped(json, false);
}

export function ShareLinkResponseBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShareLinkResponseBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ShareLinkResponseFromJSON(json['data']),
    };
}

export function ShareLinkResponseBaseResponseToJSON(value?: ShareLinkResponseBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': ShareLinkResponseToJSON(value['data']),
    };
}

