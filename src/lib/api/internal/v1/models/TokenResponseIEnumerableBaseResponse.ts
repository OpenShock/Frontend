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
import type { TokenResponse } from './TokenResponse';
import {
    TokenResponseFromJSON,
    TokenResponseFromJSONTyped,
    TokenResponseToJSON,
} from './TokenResponse';

/**
 * 
 * @export
 * @interface TokenResponseIEnumerableBaseResponse
 */
export interface TokenResponseIEnumerableBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof TokenResponseIEnumerableBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<TokenResponse>}
     * @memberof TokenResponseIEnumerableBaseResponse
     */
    data?: Array<TokenResponse> | null;
}

/**
 * Check if a given object implements the TokenResponseIEnumerableBaseResponse interface.
 */
export function instanceOfTokenResponseIEnumerableBaseResponse(value: object): value is TokenResponseIEnumerableBaseResponse {
    return true;
}

export function TokenResponseIEnumerableBaseResponseFromJSON(json: any): TokenResponseIEnumerableBaseResponse {
    return TokenResponseIEnumerableBaseResponseFromJSONTyped(json, false);
}

export function TokenResponseIEnumerableBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): TokenResponseIEnumerableBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : ((json['data'] as Array<any>).map(TokenResponseFromJSON)),
    };
}

export function TokenResponseIEnumerableBaseResponseToJSON(value?: TokenResponseIEnumerableBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': value['data'] == null ? undefined : ((value['data'] as Array<any>).map(TokenResponseToJSON)),
    };
}

