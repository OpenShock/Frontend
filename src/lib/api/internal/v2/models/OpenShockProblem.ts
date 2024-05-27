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
 * @interface OpenShockProblem
 */
export interface OpenShockProblem {
    [key: string]: any | any;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    type?: string;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    title?: string;
    /**
     * 
     * @type {number}
     * @memberof OpenShockProblem
     */
    status?: number;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    detail?: string;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    instance?: string;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     * @deprecated
     */
    readonly message?: string;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    traceId?: string;
}

/**
 * Check if a given object implements the OpenShockProblem interface.
 */
export function instanceOfOpenShockProblem(value: object): value is OpenShockProblem {
    return true;
}

export function OpenShockProblemFromJSON(json: any): OpenShockProblem {
    return OpenShockProblemFromJSONTyped(json, false);
}

export function OpenShockProblemFromJSONTyped(json: any, ignoreDiscriminator: boolean): OpenShockProblem {
    if (json == null) {
        return json;
    }
    return {
        
            ...json,
        'type': json['type'] == null ? undefined : json['type'],
        'title': json['title'] == null ? undefined : json['title'],
        'status': json['status'] == null ? undefined : json['status'],
        'detail': json['detail'] == null ? undefined : json['detail'],
        'instance': json['instance'] == null ? undefined : json['instance'],
        'message': json['message'] == null ? undefined : json['message'],
        'traceId': json['traceId'] == null ? undefined : json['traceId'],
    };
}

export function OpenShockProblemToJSON(value?: Omit<OpenShockProblem, 'message'> | null): any {
    if (value == null) {
        return value;
    }
    return {
        
            ...value,
        'type': value['type'],
        'title': value['title'],
        'status': value['status'],
        'detail': value['detail'],
        'instance': value['instance'],
        'traceId': value['traceId'],
    };
}

