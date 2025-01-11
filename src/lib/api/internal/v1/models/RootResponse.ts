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
 * @interface RootResponse
 */
export interface RootResponse {
    /**
     * 
     * @type {string}
     * @memberof RootResponse
     */
    version: string;
    /**
     * 
     * @type {string}
     * @memberof RootResponse
     */
    commit: string;
    /**
     * 
     * @type {Date}
     * @memberof RootResponse
     */
    currentTime: Date;
    /**
     * 
     * @type {string}
     * @memberof RootResponse
     */
    frontendUrl: string;
    /**
     * 
     * @type {string}
     * @memberof RootResponse
     */
    shortLinkUrl: string;
    /**
     * 
     * @type {string}
     * @memberof RootResponse
     */
    turnstileSiteKey: string | null;
}

/**
 * Check if a given object implements the RootResponse interface.
 */
export function instanceOfRootResponse(value: object): value is RootResponse {
    if (!('version' in value) || value['version'] === undefined) return false;
    if (!('commit' in value) || value['commit'] === undefined) return false;
    if (!('currentTime' in value) || value['currentTime'] === undefined) return false;
    if (!('frontendUrl' in value) || value['frontendUrl'] === undefined) return false;
    if (!('shortLinkUrl' in value) || value['shortLinkUrl'] === undefined) return false;
    if (!('turnstileSiteKey' in value) || value['turnstileSiteKey'] === undefined) return false;
    return true;
}

export function RootResponseFromJSON(json: any): RootResponse {
    return RootResponseFromJSONTyped(json, false);
}

export function RootResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): RootResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'version': json['version'],
        'commit': json['commit'],
        'currentTime': (new Date(json['currentTime'])),
        'frontendUrl': json['frontendUrl'],
        'shortLinkUrl': json['shortLinkUrl'],
        'turnstileSiteKey': json['turnstileSiteKey'],
    };
}

export function RootResponseToJSON(json: any): RootResponse {
    return RootResponseToJSONTyped(json, false);
}

export function RootResponseToJSONTyped(value?: RootResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'version': value['version'],
        'commit': value['commit'],
        'currentTime': ((value['currentTime']).toISOString()),
        'frontendUrl': value['frontendUrl'],
        'shortLinkUrl': value['shortLinkUrl'],
        'turnstileSiteKey': value['turnstileSiteKey'],
    };
}

