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
 * @interface LcgNodeResponse
 */
export interface LcgNodeResponse {
    /**
     * 
     * @type {string}
     * @memberof LcgNodeResponse
     */
    fqdn?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LcgNodeResponse
     */
    country?: string | null;
}

/**
 * Check if a given object implements the LcgNodeResponse interface.
 */
export function instanceOfLcgNodeResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function LcgNodeResponseFromJSON(json: any): LcgNodeResponse {
    return LcgNodeResponseFromJSONTyped(json, false);
}

export function LcgNodeResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): LcgNodeResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'fqdn': !exists(json, 'fqdn') ? undefined : json['fqdn'],
        'country': !exists(json, 'country') ? undefined : json['country'],
    };
}

export function LcgNodeResponseToJSON(value?: LcgNodeResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'fqdn': value.fqdn,
        'country': value.country,
    };
}
