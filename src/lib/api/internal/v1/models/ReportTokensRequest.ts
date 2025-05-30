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
/**
 * 
 * @export
 * @interface ReportTokensRequest
 */
export interface ReportTokensRequest {
    /**
     * 
     * @type {string}
     * @memberof ReportTokensRequest
     */
    turnstileResponse: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof ReportTokensRequest
     */
    secrets: Array<string>;
}

/**
 * Check if a given object implements the ReportTokensRequest interface.
 */
export function instanceOfReportTokensRequest(value: object): value is ReportTokensRequest {
    if (!('turnstileResponse' in value) || value['turnstileResponse'] === undefined) return false;
    if (!('secrets' in value) || value['secrets'] === undefined) return false;
    return true;
}

export function ReportTokensRequestFromJSON(json: any): ReportTokensRequest {
    return ReportTokensRequestFromJSONTyped(json, false);
}

export function ReportTokensRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ReportTokensRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'turnstileResponse': json['turnstileResponse'],
        'secrets': json['secrets'],
    };
}

export function ReportTokensRequestToJSON(json: any): ReportTokensRequest {
    return ReportTokensRequestToJSONTyped(json, false);
}

export function ReportTokensRequestToJSONTyped(value?: ReportTokensRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'turnstileResponse': value['turnstileResponse'],
        'secrets': value['secrets'],
    };
}

