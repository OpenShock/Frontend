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
  CreateTokenRequest,
  EditTokenRequest,
  OpenShockProblem,
  TokenCreatedResponse,
  TokenResponse,
} from '../models/index';
import {
    CreateTokenRequestFromJSON,
    CreateTokenRequestToJSON,
    EditTokenRequestFromJSON,
    EditTokenRequestToJSON,
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
    TokenCreatedResponseFromJSON,
    TokenCreatedResponseToJSON,
    TokenResponseFromJSON,
    TokenResponseToJSON,
} from '../models/index';

export interface TokensCreateTokenRequest {
    createTokenRequest?: CreateTokenRequest;
}

export interface TokensDeleteTokenRequest {
    tokenId: string;
}

export interface TokensEditTokenRequest {
    tokenId: string;
    editTokenRequest?: EditTokenRequest;
}

export interface TokensGetTokenByIdRequest {
    tokenId: string;
}

/**
 * TokensApi - interface
 * 
 * @export
 * @interface TokensApiInterface
 */
export interface TokensApiInterface {
    /**
     * 
     * @summary Create a new token
     * @param {CreateTokenRequest} [createTokenRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TokensApiInterface
     */
    tokensCreateTokenRaw(requestParameters: TokensCreateTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokenCreatedResponse>>;

    /**
     * Create a new token
     */
    tokensCreateToken(createTokenRequest?: CreateTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokenCreatedResponse>;

    /**
     * 
     * @summary Revoke a token from the current user
     * @param {string} tokenId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TokensApiInterface
     */
    tokensDeleteTokenRaw(requestParameters: TokensDeleteTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Revoke a token from the current user
     */
    tokensDeleteToken(tokenId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Edit a token
     * @param {string} tokenId 
     * @param {EditTokenRequest} [editTokenRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TokensApiInterface
     */
    tokensEditTokenRaw(requestParameters: TokensEditTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Edit a token
     */
    tokensEditToken(tokenId: string, editTokenRequest?: EditTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Get a token by id
     * @param {string} tokenId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TokensApiInterface
     */
    tokensGetTokenByIdRaw(requestParameters: TokensGetTokenByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokenResponse>>;

    /**
     * Get a token by id
     */
    tokensGetTokenById(tokenId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokenResponse>;

    /**
     * 
     * @summary List all tokens for the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TokensApiInterface
     */
    tokensListTokensRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<TokenResponse>>>;

    /**
     * List all tokens for the current user
     */
    tokensListTokens(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<TokenResponse>>;

}

/**
 * 
 */
export class TokensApi extends runtime.BaseAPI implements TokensApiInterface {

    /**
     * Create a new token
     */
    async tokensCreateTokenRaw(requestParameters: TokensCreateTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokenCreatedResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/1/tokens`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateTokenRequestToJSON(requestParameters['createTokenRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokenCreatedResponseFromJSON(jsonValue));
    }

    /**
     * Create a new token
     */
    async tokensCreateToken(createTokenRequest?: CreateTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokenCreatedResponse> {
        const response = await this.tokensCreateTokenRaw({ createTokenRequest: createTokenRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Revoke a token from the current user
     */
    async tokensDeleteTokenRaw(requestParameters: TokensDeleteTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['tokenId'] == null) {
            throw new runtime.RequiredError(
                'tokenId',
                'Required parameter "tokenId" was null or undefined when calling tokensDeleteToken().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/1/tokens/{tokenId}`.replace(`{${"tokenId"}}`, encodeURIComponent(String(requestParameters['tokenId']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Revoke a token from the current user
     */
    async tokensDeleteToken(tokenId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.tokensDeleteTokenRaw({ tokenId: tokenId }, initOverrides);
    }

    /**
     * Edit a token
     */
    async tokensEditTokenRaw(requestParameters: TokensEditTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['tokenId'] == null) {
            throw new runtime.RequiredError(
                'tokenId',
                'Required parameter "tokenId" was null or undefined when calling tokensEditToken().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/1/tokens/{tokenId}`.replace(`{${"tokenId"}}`, encodeURIComponent(String(requestParameters['tokenId']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: EditTokenRequestToJSON(requestParameters['editTokenRequest']),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Edit a token
     */
    async tokensEditToken(tokenId: string, editTokenRequest?: EditTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.tokensEditTokenRaw({ tokenId: tokenId, editTokenRequest: editTokenRequest }, initOverrides);
    }

    /**
     * Get a token by id
     */
    async tokensGetTokenByIdRaw(requestParameters: TokensGetTokenByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokenResponse>> {
        if (requestParameters['tokenId'] == null) {
            throw new runtime.RequiredError(
                'tokenId',
                'Required parameter "tokenId" was null or undefined when calling tokensGetTokenById().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/1/tokens/{tokenId}`.replace(`{${"tokenId"}}`, encodeURIComponent(String(requestParameters['tokenId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokenResponseFromJSON(jsonValue));
    }

    /**
     * Get a token by id
     */
    async tokensGetTokenById(tokenId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokenResponse> {
        const response = await this.tokensGetTokenByIdRaw({ tokenId: tokenId }, initOverrides);
        return await response.value();
    }

    /**
     * List all tokens for the current user
     */
    async tokensListTokensRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<TokenResponse>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/1/tokens`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(TokenResponseFromJSON));
    }

    /**
     * List all tokens for the current user
     */
    async tokensListTokens(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<TokenResponse>> {
        const response = await this.tokensListTokensRaw(initOverrides);
        return await response.value();
    }

}
