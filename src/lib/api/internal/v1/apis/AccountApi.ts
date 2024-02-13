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
  Login,
  ObjectBaseResponse,
  PasswordResetProcessData,
  ResetRequest,
  SignUp,
} from '../models/index';
import {
    LoginFromJSON,
    LoginToJSON,
    ObjectBaseResponseFromJSON,
    ObjectBaseResponseToJSON,
    PasswordResetProcessDataFromJSON,
    PasswordResetProcessDataToJSON,
    ResetRequestFromJSON,
    ResetRequestToJSON,
    SignUpFromJSON,
    SignUpToJSON,
} from '../models/index';

export interface AccountLoginRequest {
    login?: Login;
}

export interface AccountPasswordResetCheckValidRequest {
    passwordResetId: string;
    secret: string;
}

export interface AccountPasswordResetCompleteRequest {
    passwordResetId: string;
    secret: string;
    passwordResetProcessData?: PasswordResetProcessData;
}

export interface AccountPasswordResetInitiateRequest {
    resetRequest?: ResetRequest;
}

export interface AccountSignUpRequest {
    signUp?: SignUp;
}

/**
 * AccountApi - interface
 * 
 * @export
 * @interface AccountApiInterface
 */
export interface AccountApiInterface {
    /**
     * 
     * @summary Authenticate a user
     * @param {Login} [login] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AccountApiInterface
     */
    accountLoginRaw(requestParameters: AccountLoginRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Authenticate a user
     */
    accountLogin(login?: Login, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Check if a password reset is in progress
     * @param {string} passwordResetId The id of the password reset
     * @param {string} secret The secret of the password reset
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AccountApiInterface
     */
    accountPasswordResetCheckValidRaw(requestParameters: AccountPasswordResetCheckValidRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Check if a password reset is in progress
     */
    accountPasswordResetCheckValid(passwordResetId: string, secret: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Complete a password reset process
     * @param {string} passwordResetId The id of the password reset
     * @param {string} secret The secret of the password reset
     * @param {PasswordResetProcessData} [passwordResetProcessData] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AccountApiInterface
     */
    accountPasswordResetCompleteRaw(requestParameters: AccountPasswordResetCompleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Complete a password reset process
     */
    accountPasswordResetComplete(passwordResetId: string, secret: string, passwordResetProcessData?: PasswordResetProcessData, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Initiate a password reset
     * @param {ResetRequest} [resetRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AccountApiInterface
     */
    accountPasswordResetInitiateRaw(requestParameters: AccountPasswordResetInitiateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Initiate a password reset
     */
    accountPasswordResetInitiate(resetRequest?: ResetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Signs up a new user
     * @param {SignUp} [signUp] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AccountApiInterface
     */
    accountSignUpRaw(requestParameters: AccountSignUpRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Signs up a new user
     */
    accountSignUp(signUp?: SignUp, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

}

/**
 * 
 */
export class AccountApi extends runtime.BaseAPI implements AccountApiInterface {

    /**
     * Authenticate a user
     */
    async accountLoginRaw(requestParameters: AccountLoginRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/login`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: LoginToJSON(requestParameters.login),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Authenticate a user
     */
    async accountLogin(login?: Login, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.accountLoginRaw({ login: login }, initOverrides);
        return await response.value();
    }

    /**
     * Check if a password reset is in progress
     */
    async accountPasswordResetCheckValidRaw(requestParameters: AccountPasswordResetCheckValidRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        if (requestParameters.passwordResetId === null || requestParameters.passwordResetId === undefined) {
            throw new runtime.RequiredError('passwordResetId','Required parameter requestParameters.passwordResetId was null or undefined when calling accountPasswordResetCheckValid.');
        }

        if (requestParameters.secret === null || requestParameters.secret === undefined) {
            throw new runtime.RequiredError('secret','Required parameter requestParameters.secret was null or undefined when calling accountPasswordResetCheckValid.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/recover/{passwordResetId}/{secret}`.replace(`{${"passwordResetId"}}`, encodeURIComponent(String(requestParameters.passwordResetId))).replace(`{${"secret"}}`, encodeURIComponent(String(requestParameters.secret))),
            method: 'HEAD',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Check if a password reset is in progress
     */
    async accountPasswordResetCheckValid(passwordResetId: string, secret: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.accountPasswordResetCheckValidRaw({ passwordResetId: passwordResetId, secret: secret }, initOverrides);
        return await response.value();
    }

    /**
     * Complete a password reset process
     */
    async accountPasswordResetCompleteRaw(requestParameters: AccountPasswordResetCompleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        if (requestParameters.passwordResetId === null || requestParameters.passwordResetId === undefined) {
            throw new runtime.RequiredError('passwordResetId','Required parameter requestParameters.passwordResetId was null or undefined when calling accountPasswordResetComplete.');
        }

        if (requestParameters.secret === null || requestParameters.secret === undefined) {
            throw new runtime.RequiredError('secret','Required parameter requestParameters.secret was null or undefined when calling accountPasswordResetComplete.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/recover/{passwordResetId}/{secret}`.replace(`{${"passwordResetId"}}`, encodeURIComponent(String(requestParameters.passwordResetId))).replace(`{${"secret"}}`, encodeURIComponent(String(requestParameters.secret))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: PasswordResetProcessDataToJSON(requestParameters.passwordResetProcessData),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Complete a password reset process
     */
    async accountPasswordResetComplete(passwordResetId: string, secret: string, passwordResetProcessData?: PasswordResetProcessData, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.accountPasswordResetCompleteRaw({ passwordResetId: passwordResetId, secret: secret, passwordResetProcessData: passwordResetProcessData }, initOverrides);
        return await response.value();
    }

    /**
     * Initiate a password reset
     */
    async accountPasswordResetInitiateRaw(requestParameters: AccountPasswordResetInitiateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/reset`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ResetRequestToJSON(requestParameters.resetRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Initiate a password reset
     */
    async accountPasswordResetInitiate(resetRequest?: ResetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.accountPasswordResetInitiateRaw({ resetRequest: resetRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Signs up a new user
     */
    async accountSignUpRaw(requestParameters: AccountSignUpRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/account/signup`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SignUpToJSON(requestParameters.signUp),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Signs up a new user
     */
    async accountSignUp(signUp?: SignUp, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.accountSignUpRaw({ signUp: signUp }, initOverrides);
        return await response.value();
    }

}