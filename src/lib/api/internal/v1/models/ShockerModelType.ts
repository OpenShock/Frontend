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

/**
 * 
 * @export
 * @enum {string}
 */
export enum ShockerModelType {
    NUMBER_0 = 0,
    NUMBER_1 = 1,
    NUMBER_unknown_default_open_api = 11184809
}


export function ShockerModelTypeFromJSON(json: any): ShockerModelType {
    return ShockerModelTypeFromJSONTyped(json, false);
}

export function ShockerModelTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): ShockerModelType {
    return json as ShockerModelType;
}

export function ShockerModelTypeToJSON(value?: ShockerModelType | null): any {
    return value as any;
}

