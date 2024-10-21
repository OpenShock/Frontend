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
import type { StatsResponse } from './StatsResponse';
import {
    StatsResponseFromJSON,
    StatsResponseFromJSONTyped,
    StatsResponseToJSON,
    StatsResponseToJSONTyped,
} from './StatsResponse';

/**
 * 
 * @export
 * @interface StatsResponseBaseResponse
 */
export interface StatsResponseBaseResponse {
    /**
     * 
     * @type {string}
     * @memberof StatsResponseBaseResponse
     */
    message?: string | null;
    /**
     * 
     * @type {StatsResponse}
     * @memberof StatsResponseBaseResponse
     */
    data?: StatsResponse;
}

/**
 * Check if a given object implements the StatsResponseBaseResponse interface.
 */
export function instanceOfStatsResponseBaseResponse(value: object): value is StatsResponseBaseResponse {
    return true;
}

export function StatsResponseBaseResponseFromJSON(json: any): StatsResponseBaseResponse {
    return StatsResponseBaseResponseFromJSONTyped(json, false);
}

export function StatsResponseBaseResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): StatsResponseBaseResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'message': json['message'] == null ? undefined : json['message'],
        'data': json['data'] == null ? undefined : StatsResponseFromJSON(json['data']),
    };
}

  export function StatsResponseBaseResponseToJSON(json: any): StatsResponseBaseResponse {
      return StatsResponseBaseResponseToJSONTyped(json, false);
  }

  export function StatsResponseBaseResponseToJSONTyped(value?: StatsResponseBaseResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'message': value['message'],
        'data': StatsResponseToJSON(value['data']),
    };
}

