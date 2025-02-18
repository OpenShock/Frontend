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
 * @interface SignUp
 */
export interface SignUp {
    /**
     * 
     * @type {string}
     * @memberof SignUp
     */
    username: string;
    /**
     * 
     * @type {string}
     * @memberof SignUp
     */
    password: string;
    /**
     * 
     * @type {string}
     * @memberof SignUp
     */
    email: string;
}

/**
 * Check if a given object implements the SignUp interface.
 */
export function instanceOfSignUp(value: object): value is SignUp {
    if (!('username' in value) || value['username'] === undefined) return false;
    if (!('password' in value) || value['password'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    return true;
}

export function SignUpFromJSON(json: any): SignUp {
    return SignUpFromJSONTyped(json, false);
}

export function SignUpFromJSONTyped(json: any, ignoreDiscriminator: boolean): SignUp {
    if (json == null) {
        return json;
    }
    return {
        
        'username': json['username'],
        'password': json['password'],
        'email': json['email'],
    };
}

export function SignUpToJSON(json: any): SignUp {
    return SignUpToJSONTyped(json, false);
}

export function SignUpToJSONTyped(value?: SignUp | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'username': value['username'],
        'password': value['password'],
        'email': value['email'],
    };
}

