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


import * as runtime from '../runtime';
import type {
  CreateShareRequest,
  OpenShockProblem,
  ShareInviteBaseDetails,
  V2UserShares,
} from '../models/index';
import {
    CreateShareRequestFromJSON,
    CreateShareRequestToJSON,
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
    ShareInviteBaseDetailsFromJSON,
    ShareInviteBaseDetailsToJSON,
    V2UserSharesFromJSON,
    V2UserSharesToJSON,
} from '../models/index';

export interface SharesCreateShareInviteRequest {
    createShareRequest?: CreateShareRequest;
}

export interface SharesDeleteOutgoingInviteRequest {
    id: string;
}

export interface SharesDenyIncomingInviteRequest {
    id: string;
}

export interface SharesRedeemInviteRequest {
    id: string;
}

/**
 * ShockerSharesApi - interface
 * 
 * @export
 * @interface ShockerSharesApiInterface
 */
export interface ShockerSharesApiInterface {
    /**
     * 
     * @param {CreateShareRequest} [createShareRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerSharesApiInterface
     */
    sharesCreateShareInviteRaw(requestParameters: SharesCreateShareInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>>;

    /**
     */
    sharesCreateShareInvite(createShareRequest?: CreateShareRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string>;

    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerSharesApiInterface
     */
    sharesDeleteOutgoingInviteRaw(requestParameters: SharesDeleteOutgoingInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     */
    sharesDeleteOutgoingInvite(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerSharesApiInterface
     */
    sharesDenyIncomingInviteRaw(requestParameters: SharesDenyIncomingInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     */
    sharesDenyIncomingInvite(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerSharesApiInterface
     */
    sharesGetIncomingInvitesListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareInviteBaseDetails>>>;

    /**
     */
    sharesGetIncomingInvitesList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareInviteBaseDetails>>;

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerSharesApiInterface
     */
    sharesGetOutgoingInvitesListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareInviteBaseDetails>>>;

    /**
     */
    sharesGetOutgoingInvitesList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareInviteBaseDetails>>;

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerSharesApiInterface
     */
    sharesGetSharesByUsersRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<V2UserShares>>;

    /**
     */
    sharesGetSharesByUsers(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<V2UserShares>;

    /**
     * 
     * @summary Accept a share request and share the shockers with the current user.
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerSharesApiInterface
     */
    sharesRedeemInviteRaw(requestParameters: SharesRedeemInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Accept a share request and share the shockers with the current user.
     */
    sharesRedeemInvite(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

}

/**
 * 
 */
export class ShockerSharesApi extends runtime.BaseAPI implements ShockerSharesApiInterface {

    /**
     */
    async sharesCreateShareInviteRaw(requestParameters: SharesCreateShareInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }


        let urlPath = `/2/shares/invites`;

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateShareRequestToJSON(requestParameters['createShareRequest']),
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<string>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async sharesCreateShareInvite(createShareRequest?: CreateShareRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.sharesCreateShareInviteRaw({ createShareRequest: createShareRequest }, initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesDeleteOutgoingInviteRaw(requestParameters: SharesDeleteOutgoingInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling sharesDeleteOutgoingInvite().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }


        let urlPath = `/2/shares/invites/outgoing/{id}`;
        urlPath = urlPath.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async sharesDeleteOutgoingInvite(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.sharesDeleteOutgoingInviteRaw({ id: id }, initOverrides);
    }

    /**
     */
    async sharesDenyIncomingInviteRaw(requestParameters: SharesDenyIncomingInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling sharesDenyIncomingInvite().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }


        let urlPath = `/2/shares/invites/incoming/{id}`;
        urlPath = urlPath.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async sharesDenyIncomingInvite(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.sharesDenyIncomingInviteRaw({ id: id }, initOverrides);
    }

    /**
     */
    async sharesGetIncomingInvitesListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareInviteBaseDetails>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }


        let urlPath = `/2/shares/invites/incoming`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ShareInviteBaseDetailsFromJSON));
    }

    /**
     */
    async sharesGetIncomingInvitesList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareInviteBaseDetails>> {
        const response = await this.sharesGetIncomingInvitesListRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesGetOutgoingInvitesListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareInviteBaseDetails>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }


        let urlPath = `/2/shares/invites/outgoing`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ShareInviteBaseDetailsFromJSON));
    }

    /**
     */
    async sharesGetOutgoingInvitesList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareInviteBaseDetails>> {
        const response = await this.sharesGetOutgoingInvitesListRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesGetSharesByUsersRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<V2UserShares>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }


        let urlPath = `/2/shares`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => V2UserSharesFromJSON(jsonValue));
    }

    /**
     */
    async sharesGetSharesByUsers(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<V2UserShares> {
        const response = await this.sharesGetSharesByUsersRaw(initOverrides);
        return await response.value();
    }

    /**
     * Accept a share request and share the shockers with the current user.
     */
    async sharesRedeemInviteRaw(requestParameters: SharesRedeemInviteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling sharesRedeemInvite().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }


        let urlPath = `/2/shares/invites/incoming/{id}`;
        urlPath = urlPath.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id'])));

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Accept a share request and share the shockers with the current user.
     */
    async sharesRedeemInvite(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.sharesRedeemInviteRaw({ id: id }, initOverrides);
    }

}
