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
import type { ShockerModelType } from './ShockerModelType';
import {
    ShockerModelTypeFromJSON,
    ShockerModelTypeFromJSONTyped,
    ShockerModelTypeToJSON,
} from './ShockerModelType';

/**
 * 
 * @export
 * @interface NewShocker
 */
export interface NewShocker {
    /**
     * 
     * @type {string}
     * @memberof NewShocker
     */
    name?: string | null;
    /**
     * 
     * @type {number}
     * @memberof NewShocker
     */
    rfId?: number;
    /**
     * 
     * @type {string}
     * @memberof NewShocker
     */
    device?: string;
    /**
     * 
     * @type {ShockerModelType}
     * @memberof NewShocker
     */
    model?: ShockerModelType;
}

/**
 * Check if a given object implements the NewShocker interface.
 */
export function instanceOfNewShocker(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function NewShockerFromJSON(json: any): NewShocker {
    return NewShockerFromJSONTyped(json, false);
}

export function NewShockerFromJSONTyped(json: any, ignoreDiscriminator: boolean): NewShocker {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': !exists(json, 'name') ? undefined : json['name'],
        'rfId': !exists(json, 'rfId') ? undefined : json['rfId'],
        'device': !exists(json, 'device') ? undefined : json['device'],
        'model': !exists(json, 'model') ? undefined : ShockerModelTypeFromJSON(json['model']),
    };
}

export function NewShockerToJSON(value?: NewShocker | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'rfId': value.rfId,
        'device': value.device,
        'model': ShockerModelTypeToJSON(value.model),
    };
}
