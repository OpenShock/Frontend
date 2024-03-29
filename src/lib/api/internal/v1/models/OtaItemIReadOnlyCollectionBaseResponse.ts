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
import type { OtaItem } from './OtaItem';
import {
    OtaItemFromJSON,
    OtaItemFromJSONTyped,
    OtaItemToJSON,
} from './OtaItem';

/**
 * 
 * @export
 * @interface OtaItemIReadOnlyCollectionBaseResponse
 */
export interface OtaItemIReadOnlyCollectionBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof OtaItemIReadOnlyCollectionBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {Array<OtaItem>}
     * @memberof OtaItemIReadOnlyCollectionBaseResponse
     */
    data?: Array<OtaItem> | null;
}

/**
 * Check if a given object implements the OtaItemIReadOnlyCollectionBaseResponse interface.
 */
export function instanceOfOtaItemIReadOnlyCollectionBaseResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function OtaItemIReadOnlyCollectionBaseResponseFromJSON(json: any): OtaItemIReadOnlyCollectionBaseResponse {
    return OtaItemIReadOnlyCollectionBaseResponseFromJSONTyped(json, false);
}

export function OtaItemIReadOnlyCollectionBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): OtaItemIReadOnlyCollectionBaseResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'message': !exists(json, 'message') ? undefined : json['message'],
        'data': !exists(json, 'data') ? undefined : (json['data'] === null ? null : (json['data'] as Array<any>).map(OtaItemFromJSON)),
    };
}

export function OtaItemIReadOnlyCollectionBaseResponseToJSON(value?: OtaItemIReadOnlyCollectionBaseResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'message': value.message,
        'data': value.data === undefined ? undefined : (value.data === null ? null : (value.data as Array<any>).map(OtaItemToJSON)),
    };
}

