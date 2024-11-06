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
 * @interface LoginSessionResponse
 */
export interface LoginSessionResponse {
    /**
     * 
     * @type {string}
     * @memberof LoginSessionResponse
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof LoginSessionResponse
     */
    ip: string;
    /**
     * 
     * @type {string}
     * @memberof LoginSessionResponse
     */
    userAgent: string;
    /**
     * 
     * @type {Date}
     * @memberof LoginSessionResponse
     */
    created: Date;
    /**
     * 
     * @type {Date}
     * @memberof LoginSessionResponse
     */
    expires: Date;
}

/**
 * Check if a given object implements the LoginSessionResponse interface.
 */
export function instanceOfLoginSessionResponse(value: object): value is LoginSessionResponse {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('ip' in value) || value['ip'] === undefined) return false;
    if (!('userAgent' in value) || value['userAgent'] === undefined) return false;
    if (!('created' in value) || value['created'] === undefined) return false;
    if (!('expires' in value) || value['expires'] === undefined) return false;
    return true;
}

export function LoginSessionResponseFromJSON(json: any): LoginSessionResponse {
    return LoginSessionResponseFromJSONTyped(json, false);
}

export function LoginSessionResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): LoginSessionResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'ip': json['ip'],
        'userAgent': json['userAgent'],
        'created': (new Date(json['created'])),
        'expires': (new Date(json['expires'])),
    };
}

  export function LoginSessionResponseToJSON(json: any): LoginSessionResponse {
      return LoginSessionResponseToJSONTyped(json, false);
  }

  export function LoginSessionResponseToJSONTyped(value?: LoginSessionResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'ip': value['ip'],
        'userAgent': value['userAgent'],
        'created': ((value['created']).toISOString()),
        'expires': ((value['expires']).toISOString()),
    };
}

