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
    ShockerModelTypeToJSONTyped,
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
    name: string | null;
    /**
     * 
     * @type {number}
     * @memberof NewShocker
     */
    rfId: number;
    /**
     * 
     * @type {string}
     * @memberof NewShocker
     */
    device: string;
    /**
     * 
     * @type {ShockerModelType}
     * @memberof NewShocker
     */
    model: ShockerModelType;
}



/**
 * Check if a given object implements the NewShocker interface.
 */
export function instanceOfNewShocker(value: object): value is NewShocker {
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('rfId' in value) || value['rfId'] === undefined) return false;
    if (!('device' in value) || value['device'] === undefined) return false;
    if (!('model' in value) || value['model'] === undefined) return false;
    return true;
}

export function NewShockerFromJSON(json: any): NewShocker {
    return NewShockerFromJSONTyped(json, false);
}

export function NewShockerFromJSONTyped(json: any, ignoreDiscriminator: boolean): NewShocker {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'rfId': json['rfId'],
        'device': json['device'],
        'model': ShockerModelTypeFromJSON(json['model']),
    };
}

  export function NewShockerToJSON(json: any): NewShocker {
      return NewShockerToJSONTyped(json, false);
  }

  export function NewShockerToJSONTyped(value?: NewShocker | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'rfId': value['rfId'],
        'device': value['device'],
        'model': ShockerModelTypeToJSON(value['model']),
    };
}

