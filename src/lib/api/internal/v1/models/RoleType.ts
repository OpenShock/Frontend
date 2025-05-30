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
export enum RoleType {
    Support = 'Support',
    Staff = 'Staff',
    Admin = 'Admin',
    System = 'System'
}


export function instanceOfRoleType(value: any): boolean {
    for (const key in RoleType) {
        if (Object.prototype.hasOwnProperty.call(RoleType, key)) {
            if (RoleType[key as keyof typeof RoleType] === value) {
                return true;
            }
        }
    }
    return false;
}

export function RoleTypeFromJSON(json: any): RoleType {
    return RoleTypeFromJSONTyped(json, false);
}

export function RoleTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): RoleType {
    return json as RoleType;
}

export function RoleTypeToJSON(value?: RoleType | null): any {
    return value as any;
}

export function RoleTypeToJSONTyped(value: any, ignoreDiscriminator: boolean): RoleType {
    return value as RoleType;
}

