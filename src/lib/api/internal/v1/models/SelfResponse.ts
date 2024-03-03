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
import type { RankType } from './RankType';
import {
    RankTypeFromJSON,
    RankTypeFromJSONTyped,
    RankTypeToJSON,
} from './RankType';

/**
 * 
 * @export
 * @interface SelfResponse
 */
export interface SelfResponse {
    /**
     * 
     * @type {string}
     * @memberof SelfResponse
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof SelfResponse
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SelfResponse
     */
    email?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SelfResponse
     */
    image?: string | null;
    /**
     * 
     * @type {RankType}
     * @memberof SelfResponse
     */
    rank?: RankType;
}

/**
 * Check if a given object implements the SelfResponse interface.
 */
export function instanceOfSelfResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function SelfResponseFromJSON(json: any): SelfResponse {
    return SelfResponseFromJSONTyped(json, false);
}

export function SelfResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): SelfResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'email': !exists(json, 'email') ? undefined : json['email'],
        'image': !exists(json, 'image') ? undefined : json['image'],
        'rank': !exists(json, 'rank') ? undefined : RankTypeFromJSON(json['rank']),
    };
}

export function SelfResponseToJSON(value?: SelfResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'email': value.email,
        'image': value.image,
        'rank': RankTypeToJSON(value.rank),
    };
}

