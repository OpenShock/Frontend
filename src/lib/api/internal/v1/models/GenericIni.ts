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
 * @interface GenericIni
 */
export interface GenericIni {
    /**
     * 
     * @type {string}
     * @memberof GenericIni
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof GenericIni
     */
    name: string | null;
    /**
     * 
     * @type {string}
     * @memberof GenericIni
     */
    image: string | null;
}

/**
 * Check if a given object implements the GenericIni interface.
 */
export function instanceOfGenericIni(value: object): boolean {
    if (!('id' in value)) return false;
    if (!('name' in value)) return false;
    if (!('image' in value)) return false;
    return true;
}

export function GenericIniFromJSON(json: any): GenericIni {
    return GenericIniFromJSONTyped(json, false);
}

export function GenericIniFromJSONTyped(json: any, ignoreDiscriminator: boolean): GenericIni {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'image': json['image'],
    };
}

export function GenericIniToJSON(value?: GenericIni | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'id': value['id'],
        'name': value['name'],
        'image': value['image'],
    };
}

