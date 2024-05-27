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
 * @interface TokenResponseBaseResponse
 */
export interface TokenResponseBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof TokenResponseBaseResponse
     */
    message?: string;
    /**
     * 
     * @type {TokenResponse}
     * @memberof TokenResponseBaseResponse
     */
    data?: TokenResponse;
}

/**
 * Check if a given object implements the TokenResponseBaseResponse interface.
 */
export function instanceOfTokenResponseBaseResponse(value: object): value is TokenResponseBaseResponse {
    return true;
}

export function TokenResponseBaseResponseFromJSON(json: any): TokenResponseBaseResponse {
    return TokenResponseBaseResponseFromJSONTyped(json, false);
}

export function TokenResponseBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): TokenResponseBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : TokenResponseFromJSON(json['data']),
    };
}

export function TokenResponseBaseResponseToJSON(value?: TokenResponseBaseResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'message': value['message'],
        'data': TokenResponseToJSON(value['data']),
    };
}

