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
  ChangeEmailRequest,
  ChangePasswordRequest,
  ChangeUsernameRequest,
  ObjectBaseResponse,
  OpenShockProblem,
} from '../models/index';
import {
    ChangeEmailRequestFromJSON,
    ChangeEmailRequestToJSON,
    ChangePasswordRequestFromJSON,
    ChangePasswordRequestToJSON,
    ChangeUsernameRequestFromJSON,
    ChangeUsernameRequestToJSON,
    ObjectBaseResponseFromJSON,
    ObjectBaseResponseToJSON,
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
} from '../models/index';

export interface AuthenticatedAccountChangeEmailRequest {
    changeEmailRequest?: ChangeEmailRequest;
}

export interface AuthenticatedAccountChangePasswordRequest {
    changePasswordRequest?: ChangePasswordRequest;
}

export interface AuthenticatedAccountChangeUsernameRequest {
    changeUsernameRequest?: ChangeUsernameRequest;
}

/**
 * AuthenticatedAccountApi - interface
 * 
 * @export
 * @interface AuthenticatedAccountApiInterface
 */
export interface AuthenticatedAccountApiInterface {
    /**
     * 
     * @summary Change the password of the current user
     * @param {ChangeEmailRequest} [changeEmailRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticatedAccountApiInterface
     */
    authenticatedAccountChangeEmailRaw(requestParameters: AuthenticatedAccountChangeEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Change the password of the current user
     */
    authenticatedAccountChangeEmail(changeEmailRequest?: ChangeEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Change the password of the current user
     * @param {ChangePasswordRequest} [changePasswordRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticatedAccountApiInterface
     */
    authenticatedAccountChangePasswordRaw(requestParameters: AuthenticatedAccountChangePasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Change the password of the current user
     */
    authenticatedAccountChangePassword(changePasswordRequest?: ChangePasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Change the username of the current user
     * @param {ChangeUsernameRequest} [changeUsernameRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticatedAccountApiInterface
     */
    authenticatedAccountChangeUsernameRaw(requestParameters: AuthenticatedAccountChangeUsernameRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Change the username of the current user
     */
    authenticatedAccountChangeUsername(changeUsernameRequest?: ChangeUsernameRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

}

/**
 * 
 */
export class AuthenticatedAccountApi extends runtime.BaseAPI implements AuthenticatedAccountApiInterface {

    /**
     * Change the password of the current user
     */
    async authenticatedAccountChangeEmailRaw(requestParameters: AuthenticatedAccountChangeEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/email`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ChangeEmailRequestToJSON(requestParameters['changeEmailRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Change the password of the current user
     */
    async authenticatedAccountChangeEmail(changeEmailRequest?: ChangeEmailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.authenticatedAccountChangeEmailRaw({ changeEmailRequest: changeEmailRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Change the password of the current user
     */
    async authenticatedAccountChangePasswordRaw(requestParameters: AuthenticatedAccountChangePasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/password`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ChangePasswordRequestToJSON(requestParameters['changePasswordRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Change the password of the current user
     */
    async authenticatedAccountChangePassword(changePasswordRequest?: ChangePasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.authenticatedAccountChangePasswordRaw({ changePasswordRequest: changePasswordRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Change the username of the current user
     */
    async authenticatedAccountChangeUsernameRaw(requestParameters: AuthenticatedAccountChangeUsernameRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/username`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ChangeUsernameRequestToJSON(requestParameters['changeUsernameRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Change the username of the current user
     */
    async authenticatedAccountChangeUsername(changeUsernameRequest?: ChangeUsernameRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.authenticatedAccountChangeUsernameRaw({ changeUsernameRequest: changeUsernameRequest }, initOverrides);
        return await response.value();
    }

}