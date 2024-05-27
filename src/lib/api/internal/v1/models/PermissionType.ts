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
export enum PermissionType {
    shockersUse = 'shockers.use',
    shockersEdit = 'shockers.edit',
    shockersPause = 'shockers.pause',
    devicesEdit = 'devices.edit',
    unknownDefaultOpenApi = '11184809'
}


export function instanceOfPermissionType(value: any): boolean {
    for (const key in PermissionType) {
        if (Object.prototype.hasOwnProperty.call(PermissionType, key)) {
            if (PermissionType[key] === value) {
                return true;
            }
        }
    }
    return false;
}

export function PermissionTypeFromJSON(json: any): PermissionType {
    return PermissionTypeFromJSONTyped(json, false);
}

export function PermissionTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): PermissionType {
    return json as PermissionType;
}

export function PermissionTypeToJSON(value?: PermissionType | null): any {
    return value as any;
}

