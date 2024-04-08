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
 * @interface OpenShockProblem
 */
export interface OpenShockProblem {
    [key: string]: any | any;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    type?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    title?: string | null;
    /**
     * 
     * @type {number}
     * @memberof OpenShockProblem
     */
    status?: number | null;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    detail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    instance?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     * @deprecated
     */
    readonly message?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OpenShockProblem
     */
    traceId?: string | null;
}

/**
 * Check if a given object implements the OpenShockProblem interface.
 */
export function instanceOfOpenShockProblem(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function OpenShockProblemFromJSON(json: any): OpenShockProblem {
    return OpenShockProblemFromJSONTyped(json, false);
}

export function OpenShockProblemFromJSONTyped(json: any, ignoreDiscriminator: boolean): OpenShockProblem {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
            ...json,
        'type': !exists(json, 'type') ? undefined : json['type'],
        'title': !exists(json, 'title') ? undefined : json['title'],
        'status': !exists(json, 'status') ? undefined : json['status'],
        'detail': !exists(json, 'detail') ? undefined : json['detail'],
        'instance': !exists(json, 'instance') ? undefined : json['instance'],
        'message': !exists(json, 'message') ? undefined : json['message'],
        'traceId': !exists(json, 'traceId') ? undefined : json['traceId'],
    };
}

export function OpenShockProblemToJSON(value?: OpenShockProblem | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
            ...value,
        'type': value.type,
        'title': value.title,
        'status': value.status,
        'detail': value.detail,
        'instance': value.instance,
        'traceId': value.traceId,
    };
}

