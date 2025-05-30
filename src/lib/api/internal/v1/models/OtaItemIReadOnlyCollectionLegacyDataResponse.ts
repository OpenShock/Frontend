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
import type { OtaItem } from './OtaItem';
import {
    OtaItemFromJSON,
    OtaItemFromJSONTyped,
    OtaItemToJSON,
    OtaItemToJSONTyped,
} from './OtaItem';

/**
 * 
 * @export
 * @interface OtaItemIReadOnlyCollectionLegacyDataResponse
 */
export interface OtaItemIReadOnlyCollectionLegacyDataResponse {
    /**
     * 
     * @type {string}
     * @memberof OtaItemIReadOnlyCollectionLegacyDataResponse
     */
    message: string;
    /**
     * 
     * @type {Array<OtaItem>}
     * @memberof OtaItemIReadOnlyCollectionLegacyDataResponse
     */
    data: Array<OtaItem> | null;
}

/**
 * Check if a given object implements the OtaItemIReadOnlyCollectionLegacyDataResponse interface.
 */
export function instanceOfOtaItemIReadOnlyCollectionLegacyDataResponse(value: object): value is OtaItemIReadOnlyCollectionLegacyDataResponse {
    if (!('message' in value) || value['message'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    return true;
}

export function OtaItemIReadOnlyCollectionLegacyDataResponseFromJSON(json: any): OtaItemIReadOnlyCollectionLegacyDataResponse {
    return OtaItemIReadOnlyCollectionLegacyDataResponseFromJSONTyped(json, false);
}

export function OtaItemIReadOnlyCollectionLegacyDataResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): OtaItemIReadOnlyCollectionLegacyDataResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'],
        'data': (json['data'] == null ? null : (json['data'] as Array<any>).map(OtaItemFromJSON)),
    };
}

export function OtaItemIReadOnlyCollectionLegacyDataResponseToJSON(json: any): OtaItemIReadOnlyCollectionLegacyDataResponse {
    return OtaItemIReadOnlyCollectionLegacyDataResponseToJSONTyped(json, false);
}

export function OtaItemIReadOnlyCollectionLegacyDataResponseToJSONTyped(value?: OtaItemIReadOnlyCollectionLegacyDataResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': (value['data'] == null ? null : (value['data'] as Array<any>).map(OtaItemToJSON)),
    };
}

