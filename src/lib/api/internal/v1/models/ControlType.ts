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
export enum ControlType {
    stop = 'Stop',
    shock = 'Shock',
    vibrate = 'Vibrate',
    sound = 'Sound',
    unknownDefaultOpenApi = '11184809'
}


export function ControlTypeFromJSON(json: any): ControlType {
    return ControlTypeFromJSONTyped(json, false);
}

export function ControlTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): ControlType {
    return json as ControlType;
}

export function ControlTypeToJSON(value?: ControlType | null): any {
    return value as any;
}

