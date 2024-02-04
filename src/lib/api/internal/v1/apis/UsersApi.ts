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


import * as runtime from '../runtime';
import type {
  SelfResponseBaseResponse,
} from '../models/index';
import {
    SelfResponseBaseResponseFromJSON,
    SelfResponseBaseResponseToJSON,
} from '../models/index';

/**
 * UsersApi - interface
 * 
 * @export
 * @interface UsersApiInterface
 */
export interface UsersApiInterface {
    /**
     * 
     * @summary Get the current user\'s information.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApiInterface
     */
    usersGetSelfRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SelfResponseBaseResponse>>;

    /**
     * Get the current user\'s information.
     */
    usersGetSelf(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SelfResponseBaseResponse>;

}

/**
 * 
 */
export class UsersApi extends runtime.BaseAPI implements UsersApiInterface {

    /**
     * Get the current user\'s information.
     */
    async usersGetSelfRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SelfResponseBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/users/self`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SelfResponseBaseResponseFromJSON(jsonValue));
    }

    /**
     * Get the current user\'s information.
     */
    async usersGetSelf(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SelfResponseBaseResponse> {
        const response = await this.usersGetSelfRaw(initOverrides);
        return await response.value();
    }

}
