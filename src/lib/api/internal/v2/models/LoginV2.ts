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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface LoginV2
 */
export interface LoginV2 {
    /**
     * 
     * @type {string}
     * @memberof LoginV2
     */
    password: string;
    /**
     * 
     * @type {string}
     * @memberof LoginV2
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof LoginV2
     */
    turnstileResponse: string;
}

/**
 * Check if a given object implements the LoginV2 interface.
 */
export function instanceOfLoginV2(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "password" in value;
    isInstance = isInstance && "email" in value;
    isInstance = isInstance && "turnstileResponse" in value;

    return isInstance;
}

export function LoginV2FromJSON(json: any): LoginV2 {
    return LoginV2FromJSONTyped(json, false);
}

export function LoginV2FromJSONTyped(json: any, ignoreDiscriminator: boolean): LoginV2 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'password': json['password'],
        'email': json['email'],
        'turnstileResponse': json['turnstileResponse'],
    };
}

export function LoginV2ToJSON(value?: LoginV2 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'password': value.password,
        'email': value.email,
        'turnstileResponse': value.turnstileResponse,
    };
}

