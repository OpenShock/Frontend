/* tslint:disable */
/* eslint-disable */
/**
 * OpenShock.API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2
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
 * @interface SignUpV2
 */
export interface SignUpV2 {
    /**
     * 
     * @type {string}
     * @memberof SignUpV2
     */
    username: string;
    /**
     * 
     * @type {string}
     * @memberof SignUpV2
     */
    password: string;
    /**
     * 
     * @type {string}
     * @memberof SignUpV2
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof SignUpV2
     */
    turnstileResponse: string;
}

/**
 * Check if a given object implements the SignUpV2 interface.
 */
export function instanceOfSignUpV2(value: object): value is SignUpV2 {
    if (!('username' in value) || value['username'] === undefined) return false;
    if (!('password' in value) || value['password'] === undefined) return false;
    if (!('email' in value) || value['email'] === undefined) return false;
    if (!('turnstileResponse' in value) || value['turnstileResponse'] === undefined) return false;
    return true;
}

export function SignUpV2FromJSON(json: any): SignUpV2 {
    return SignUpV2FromJSONTyped(json, false);
}

export function SignUpV2FromJSONTyped(json: any, ignoreDiscriminator: boolean): SignUpV2 {
    if (json == null) {
        return json;
    }
    return {
        
        'username': json['username'],
        'password': json['password'],
        'email': json['email'],
        'turnstileResponse': json['turnstileResponse'],
    };
}

export function SignUpV2ToJSON(json: any): SignUpV2 {
    return SignUpV2ToJSONTyped(json, false);
}

export function SignUpV2ToJSONTyped(value?: SignUpV2 | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'username': value['username'],
        'password': value['password'],
        'email': value['email'],
        'turnstileResponse': value['turnstileResponse'],
    };
}

