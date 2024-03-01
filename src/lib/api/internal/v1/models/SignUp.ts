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
 * @interface SignUp
 */
export interface SignUp {
    /**
     * 
     * @type {string}
     * @memberof SignUp
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SignUp
     */
    password?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SignUp
     */
    email?: string | null;
}

/**
 * Check if a given object implements the SignUp interface.
 */
export function instanceOfSignUp(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function SignUpFromJSON(json: any): SignUp {
    return SignUpFromJSONTyped(json, false);
}

export function SignUpFromJSONTyped(json: any, ignoreDiscriminator: boolean): SignUp {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'username': !exists(json, 'username') ? undefined : json['username'],
        'password': !exists(json, 'password') ? undefined : json['password'],
        'email': !exists(json, 'email') ? undefined : json['email'],
    };
}

export function SignUpToJSON(value?: SignUp | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'username': value.username,
        'password': value.password,
        'email': value.email,
    };
}
