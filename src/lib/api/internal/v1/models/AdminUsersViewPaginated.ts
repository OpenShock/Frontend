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
import type { AdminUsersView } from './AdminUsersView';
import {
    AdminUsersViewFromJSON,
    AdminUsersViewFromJSONTyped,
    AdminUsersViewToJSON,
    AdminUsersViewToJSONTyped,
} from './AdminUsersView';

/**
 * 
 * @export
 * @interface AdminUsersViewPaginated
 */
export interface AdminUsersViewPaginated {
    /**
     * 
     * @type {number}
     * @memberof AdminUsersViewPaginated
     */
    offset: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersViewPaginated
     */
    limit: number;
    /**
     * 
     * @type {number}
     * @memberof AdminUsersViewPaginated
     */
    total: number;
    /**
     * 
     * @type {Array<AdminUsersView>}
     * @memberof AdminUsersViewPaginated
     */
    data: Array<AdminUsersView>;
}

/**
 * Check if a given object implements the AdminUsersViewPaginated interface.
 */
export function instanceOfAdminUsersViewPaginated(value: object): value is AdminUsersViewPaginated {
    if (!('offset' in value) || value['offset'] === undefined) return false;
    if (!('limit' in value) || value['limit'] === undefined) return false;
    if (!('total' in value) || value['total'] === undefined) return false;
    if (!('data' in value) || value['data'] === undefined) return false;
    return true;
}

export function AdminUsersViewPaginatedFromJSON(json: any): AdminUsersViewPaginated {
    return AdminUsersViewPaginatedFromJSONTyped(json, false);
}

export function AdminUsersViewPaginatedFromJSONTyped(json: any, ignoreDiscriminator: boolean): AdminUsersViewPaginated {
    if (json == null) {
        return json;
    }
    return {
        
        'offset': json['offset'],
        'limit': json['limit'],
        'total': json['total'],
        'data': ((json['data'] as Array<any>).map(AdminUsersViewFromJSON)),
    };
}

export function AdminUsersViewPaginatedToJSON(json: any): AdminUsersViewPaginated {
    return AdminUsersViewPaginatedToJSONTyped(json, false);
}

export function AdminUsersViewPaginatedToJSONTyped(value?: AdminUsersViewPaginated | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'offset': value['offset'],
        'limit': value['limit'],
        'total': value['total'],
        'data': ((value['data'] as Array<any>).map(AdminUsersViewToJSON)),
    };
}

