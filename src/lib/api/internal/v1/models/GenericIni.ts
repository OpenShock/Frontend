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
 * @interface GenericIni
 */
export interface GenericIni {
    /**
     * 
     * @type {string}
     * @memberof GenericIni
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof GenericIni
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof GenericIni
     */
    image?: string | null;
}

/**
 * Check if a given object implements the GenericIni interface.
 */
export function instanceOfGenericIni(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function GenericIniFromJSON(json: any): GenericIni {
    return GenericIniFromJSONTyped(json, false);
}

export function GenericIniFromJSONTyped(json: any, ignoreDiscriminator: boolean): GenericIni {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'image': !exists(json, 'image') ? undefined : json['image'],
    };
}

export function GenericIniToJSON(value?: GenericIni | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'image': value.image,
    };
}

