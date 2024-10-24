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
export enum RankType {
    user = 'User',
    support = 'Support',
    staff = 'Staff',
    admin = 'Admin',
    system = 'System',
    unknownDefaultOpenApi = '11184809'
}


export function instanceOfRankType(value: any): boolean {
    for (const key in RankType) {
        if (Object.prototype.hasOwnProperty.call(RankType, key)) {
            if (RankType[key as keyof typeof RankType] === value) {
                return true;
            }
        }
    }
    return false;
}

export function RankTypeFromJSON(json: any): RankType {
    return RankTypeFromJSONTyped(json, false);
}

export function RankTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): RankType {
    return json as RankType;
}

export function RankTypeToJSON(value?: RankType | null): any {
    return value as any;
}

export function RankTypeToJSONTyped(value: any, ignoreDiscriminator: boolean): RankType {
    return value as RankType;
}

