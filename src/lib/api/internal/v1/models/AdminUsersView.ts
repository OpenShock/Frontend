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
import type { PasswordHashingAlgorithm } from './PasswordHashingAlgorithm';
import {
    PasswordHashingAlgorithmFromJSON,
    PasswordHashingAlgorithmFromJSONTyped,
    PasswordHashingAlgorithmToJSON,
    PasswordHashingAlgorithmToJSONTyped,
} from './PasswordHashingAlgorithm';
import type { RoleType } from './RoleType';
import {
    RoleTypeFromJSON,
    RoleTypeFromJSONTyped,
    RoleTypeToJSON,
    RoleTypeToJSONTyped,
} from './RoleType';

/**
 * 
 * @export
 * @interface AdminUsersView
 */
export interface AdminUsersView {
    /**
     * 
     * @type {string}
     * @memberof AdminUsersView
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUsersView
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUsersView
     */
    email: string;
    /**
     * 
     * @type {PasswordHashingAlgorithm}
     * @memberof AdminUsersView
     */
    passwordHashType: PasswordHashingAlgorithm;
    /**
     * 
     * @type {Date}
     * @memberof AdminUsersView
     */
    createdAt: Date;
    /**
     * 
     * @type {boolean}
     * @memberof AdminUsersView
     */
    emailActivated: boolean;
    /**
     * 
     * @type {Array<RoleType>}
     * @memberof AdminUsersView
     */
    roles: Array<RoleType>;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    apiTokenCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    passwordResetCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    shockerShareCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    shockerShareLinkCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    emailChangeRequestCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    nameChangeRequestCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    userActivationCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    deviceCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    shockerCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersView
     */
    shockerControlLogCount: number;
}



/**
 * Check if a given object implements the AdminUsersView interface.
 */
export function instanceOfAdminUsersView(value: object): value is AdminUsersView {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('passwordHashType' in value) || value['passwordHashType'] === undefined) return false;
    if (!('createdAt' in value) || value['createdAt'] === undefined) return false;
    if (!('emailActivated' in value) || value['emailActivated'] === undefined) return false;
    if (!('roles' in value) || value['roles'] === undefined) return false;
    if (!('apiTokenCount' in value) || value['apiTokenCount'] === undefined) return false;
    if (!('passwordResetCount' in value) || value['passwordResetCount'] === undefined) return false;
    if (!('shockerShareCount' in value) || value['shockerShareCount'] === undefined) return false;
    if (!('shockerShareLinkCount' in value) || value['shockerShareLinkCount'] === undefined) return false;
    if (!('emailChangeRequestCount' in value) || value['emailChangeRequestCount'] === undefined) return false;
    if (!('nameChangeRequestCount' in value) || value['nameChangeRequestCount'] === undefined) return false;
    if (!('userActivationCount' in value) || value['userActivationCount'] === undefined) return false;
    if (!('deviceCount' in value) || value['deviceCount'] === undefined) return false;
    if (!('shockerCount' in value) || value['shockerCount'] === undefined) return false;
    if (!('shockerControlLogCount' in value) || value['shockerControlLogCount'] === undefined) return false;
    return true;
}

export function AdminUsersViewFromJSON(json: any): AdminUsersView {
    return AdminUsersViewFromJSONTyped(json, false);
}

export function AdminUsersViewFromJSONTyped(json: any, ignoreDiscriminator: boolean): AdminUsersView {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'email': json['email'],
        'passwordHashType': PasswordHashingAlgorithmFromJSON(json['passwordHashType']),
        'createdAt': (new Date(json['createdAt'])),
        'emailActivated': json['emailActivated'],
        'roles': ((json['roles'] as Array<any>).map(RoleTypeFromJSON)),
        'apiTokenCount': json['apiTokenCount'],
        'passwordResetCount': json['passwordResetCount'],
        'shockerShareCount': json['shockerShareCount'],
        'shockerShareLinkCount': json['shockerShareLinkCount'],
        'emailChangeRequestCount': json['emailChangeRequestCount'],
        'nameChangeRequestCount': json['nameChangeRequestCount'],
        'userActivationCount': json['userActivationCount'],
        'deviceCount': json['deviceCount'],
        'shockerCount': json['shockerCount'],
        'shockerControlLogCount': json['shockerControlLogCount'],
    };
}

export function AdminUsersViewToJSON(json: any): AdminUsersView {
    return AdminUsersViewToJSONTyped(json, false);
}

export function AdminUsersViewToJSONTyped(value?: AdminUsersView | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'email': value['email'],
        'passwordHashType': PasswordHashingAlgorithmToJSON(value['passwordHashType']),
        'createdAt': ((value['createdAt']).toISOString()),
        'emailActivated': value['emailActivated'],
        'roles': ((value['roles'] as Array<any>).map(RoleTypeToJSON)),
        'apiTokenCount': value['apiTokenCount'],
        'passwordResetCount': value['passwordResetCount'],
        'shockerShareCount': value['shockerShareCount'],
        'shockerShareLinkCount': value['shockerShareLinkCount'],
        'emailChangeRequestCount': value['emailChangeRequestCount'],
        'nameChangeRequestCount': value['nameChangeRequestCount'],
        'userActivationCount': value['userActivationCount'],
        'deviceCount': value['deviceCount'],
        'shockerCount': value['shockerCount'],
        'shockerControlLogCount': value['shockerControlLogCount'],
    };
}

