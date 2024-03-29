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
/**
 * 
 * @export
 * @interface PauseReasonBaseResponse
 */
export interface PauseReasonBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof PauseReasonBaseResponse
     */
    message?: string | null;
    /**
     * An integer representing the reason(s) for the shocker being paused, expressed as a bitfield where reasons are OR'd together.
     * 
     * Each bit corresponds to:
     * - 1: Shocker
     * - 2: Share
     * - 4: ShareLink
     * 
     * For example, a value of 6 (2 | 4) indicates both 'Share' and 'ShareLink' reasons.
     * @type {number}
     * @memberof PauseReasonBaseResponse
     */
    data?: number;
}

/**
 * Check if a given object implements the PauseReasonBaseResponse interface.
 */
export function instanceOfPauseReasonBaseResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function PauseReasonBaseResponseFromJSON(json: any): PauseReasonBaseResponse {
    return PauseReasonBaseResponseFromJSONTyped(json, false);
}

export function PauseReasonBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PauseReasonBaseResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'message': !exists(json, 'message') ? undefined : json['message'],
        'data': !exists(json, 'data') ? undefined : json['data'],
    };
}

export function PauseReasonBaseResponseToJSON(value?: PauseReasonBaseResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'message': value.message,
        'data': value.data,
    };
}

