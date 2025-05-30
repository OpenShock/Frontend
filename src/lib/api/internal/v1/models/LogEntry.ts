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
import type { ControlType } from './ControlType';
import {
    ControlTypeFromJSON,
    ControlTypeFromJSONTyped,
    ControlTypeToJSON,
    ControlTypeToJSONTyped,
} from './ControlType';
import type { ControlLogSenderLight } from './ControlLogSenderLight';
import {
    ControlLogSenderLightFromJSON,
    ControlLogSenderLightFromJSONTyped,
    ControlLogSenderLightToJSON,
    ControlLogSenderLightToJSONTyped,
} from './ControlLogSenderLight';

/**
 * 
 * @export
 * @interface LogEntry
 */
export interface LogEntry {
    /**
     * 
     * @type {string}
     * @memberof LogEntry
     */
    id: string;
    /**
     * 
     * @type {Date}
     * @memberof LogEntry
     */
    createdOn: Date;
    /**
     * 
     * @type {ControlType}
     * @memberof LogEntry
     */
    type: ControlType;
    /**
     * 
     * @type {ControlLogSenderLight}
     * @memberof LogEntry
     */
    controlledBy: ControlLogSenderLight;
    /**
     * 
     * @type {number}
     * @memberof LogEntry
     */
    intensity: number;
    /**
     * 
     * @type {number}
     * @memberof LogEntry
     */
    duration: number;
}



/**
 * Check if a given object implements the LogEntry interface.
 */
export function instanceOfLogEntry(value: object): value is LogEntry {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('createdOn' in value) || value['createdOn'] === undefined) return false;
    if (!('type' in value) || value['type'] === undefined) return false;
    if (!('controlledBy' in value) || value['controlledBy'] === undefined) return false;
    if (!('intensity' in value) || value['intensity'] === undefined) return false;
    if (!('duration' in value) || value['duration'] === undefined) return false;
    return true;
}

export function LogEntryFromJSON(json: any): LogEntry {
    return LogEntryFromJSONTyped(json, false);
}

export function LogEntryFromJSONTyped(json: any, ignoreDiscriminator: boolean): LogEntry {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'createdOn': (new Date(json['createdOn'])),
        'type': ControlTypeFromJSON(json['type']),
        'controlledBy': ControlLogSenderLightFromJSON(json['controlledBy']),
        'intensity': json['intensity'],
        'duration': json['duration'],
    };
}

export function LogEntryToJSON(json: any): LogEntry {
    return LogEntryToJSONTyped(json, false);
}

export function LogEntryToJSONTyped(value?: LogEntry | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'createdOn': ((value['createdOn']).toISOString()),
        'type': ControlTypeToJSON(value['type']),
        'controlledBy': ControlLogSenderLightToJSON(value['controlledBy']),
        'intensity': value['intensity'],
        'duration': value['duration'],
    };
}

