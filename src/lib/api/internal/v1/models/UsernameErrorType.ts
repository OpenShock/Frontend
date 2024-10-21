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
export enum UsernameErrorType {
    tooShort = 'TooShort',
    tooLong = 'TooLong',
    startOrEndWithWhitespace = 'StartOrEndWithWhitespace',
    resembleEmail = 'ResembleEmail',
    obnoxiousCharacters = 'ObnoxiousCharacters',
    unknownDefaultOpenApi = '11184809'
}


export function instanceOfUsernameErrorType(value: any): boolean {
    for (const key in UsernameErrorType) {
        if (Object.prototype.hasOwnProperty.call(UsernameErrorType, key)) {
            if (UsernameErrorType[key as keyof typeof UsernameErrorType] === value) {
                return true;
            }
        }
    }
    return false;
}

export function UsernameErrorTypeFromJSON(json: any): UsernameErrorType {
    return UsernameErrorTypeFromJSONTyped(json, false);
}

export function UsernameErrorTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): UsernameErrorType {
    return json as UsernameErrorType;
}

export function UsernameErrorTypeToJSON(value?: UsernameErrorType | null): any {
    return value as any;
}

export function UsernameErrorTypeToJSONTyped(value: any, ignoreDiscriminator: boolean): UsernameErrorType {
    return value as UsernameErrorType;
}

