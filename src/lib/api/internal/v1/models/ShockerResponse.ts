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
import type { ShockerModelType } from './ShockerModelType';
import {
    ShockerModelTypeFromJSON,
    ShockerModelTypeFromJSONTyped,
    ShockerModelTypeToJSON,
} from './ShockerModelType';

/**
 * 
 * @export
 * @interface ShockerResponse
 */
export interface ShockerResponse {
    /**
     * 
     * @type {string}
     * @memberof ShockerResponse
     */
    id: string;
    /**
     * 
     * @type {number}
     * @memberof ShockerResponse
     */
    rfId: number;
    /**
     * 
     * @type {ShockerModelType}
     * @memberof ShockerResponse
     */
    model: ShockerModelType;
    /**
     * 
     * @type {string}
     * @memberof ShockerResponse
     */
    name: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof ShockerResponse
     */
    isPaused: boolean;
    /**
     * 
     * @type {Date}
     * @memberof ShockerResponse
     */
    createdOn: Date;
}

/**
 * Check if a given object implements the ShockerResponse interface.
 */
export function instanceOfShockerResponse(value: object): value is ShockerResponse {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('rfId' in value) || value['rfId'] === undefined) return false;
    if (!('model' in value) || value['model'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('isPaused' in value) || value['isPaused'] === undefined) return false;
    if (!('createdOn' in value) || value['createdOn'] === undefined) return false;
    return true;
}

export function ShockerResponseFromJSON(json: any): ShockerResponse {
    return ShockerResponseFromJSONTyped(json, false);
}

export function ShockerResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShockerResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'rfId': json['rfId'],
        'model': ShockerModelTypeFromJSON(json['model']),
        'name': json['name'],
        'isPaused': json['isPaused'],
        'createdOn': (new Date(json['createdOn'])),
    };
}

export function ShockerResponseToJSON(value?: ShockerResponse | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'rfId': value['rfId'],
        'model': ShockerModelTypeToJSON(value['model']),
        'name': value['name'],
        'isPaused': value['isPaused'],
        'createdOn': ((value['createdOn']).toISOString()),
    };
}

