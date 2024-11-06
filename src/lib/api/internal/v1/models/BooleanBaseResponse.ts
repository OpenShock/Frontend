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
 * @interface BooleanBaseResponse
 */
export interface BooleanBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof BooleanBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof BooleanBaseResponse
     */
    data?: boolean;
}

/**
 * Check if a given object implements the BooleanBaseResponse interface.
 */
export function instanceOfBooleanBaseResponse(value: object): value is BooleanBaseResponse {
    return true;
}

export function BooleanBaseResponseFromJSON(json: any): BooleanBaseResponse {
    return BooleanBaseResponseFromJSONTyped(json, false);
}

export function BooleanBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): BooleanBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : json['data'],
    };
}

  export function BooleanBaseResponseToJSON(json: any): BooleanBaseResponse {
      return BooleanBaseResponseToJSONTyped(json, false);
  }

  export function BooleanBaseResponseToJSONTyped(value?: BooleanBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': value['data'],
    };
}

