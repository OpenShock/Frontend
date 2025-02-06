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
  GenericIni,
  OpenShockProblem,
  ShareRequestBaseDetails,
  ShareRequestBaseItem,
  UserShareInfo,
} from '../models/index';
import {
    CreateShareRequestFromJSON,
    CreateShareRequestToJSON,
    GenericIniFromJSON,
    GenericIniToJSON,
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
    ShareRequestBaseDetailsFromJSON,
    ShareRequestBaseDetailsToJSON,
    ShareRequestBaseItemFromJSON,
    ShareRequestBaseItemToJSON,
    UserShareInfoFromJSON,
    UserShareInfoToJSON,
} from '../models/index';

export interface SharesCreateShareRequest {
    createShareRequest?: CreateShareRequest;
}

export interface SharesDeleteRequestRequest {
    id: string;
}

export interface SharesDenyRequestRequest {
    id: string;
}

export interface SharesGetRequestRequest {
    id: string;
}

export interface SharesGetSharesToUserRequest {
    userId: string;
}

/**
 * SharesApi - interface
 * 
 * @export
 * @interface SharesApiInterface
 */
export interface SharesApiInterface {
    /**
     * 
     * @param {CreateShareRequest} [createShareRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesCreateShareRaw(requestParameters: SharesCreateShareRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>>;

    /**
     */
    sharesCreateShare(createShareRequest?: CreateShareRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string>;

    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesDeleteRequestRaw(requestParameters: SharesDeleteRequestRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     */
    sharesDeleteRequest(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesDenyRequestRaw(requestParameters: SharesDenyRequestRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     */
    sharesDenyRequest(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesGetIncomingRequestsListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareRequestBaseItem>>>;

    /**
     */
    sharesGetIncomingRequestsList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareRequestBaseItem>>;

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesGetOutstandingRequestsListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareRequestBaseItem>>>;

    /**
     */
    sharesGetOutstandingRequestsList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareRequestBaseItem>>;

    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesGetRequestRaw(requestParameters: SharesGetRequestRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ShareRequestBaseDetails>>;

    /**
     */
    sharesGetRequest(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ShareRequestBaseDetails>;

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesGetSharesByUsersRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<GenericIni>>>;

    /**
     */
    sharesGetSharesByUsers(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<GenericIni>>;

    /**
     * 
     * @param {string} userId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SharesApiInterface
     */
    sharesGetSharesToUserRaw(requestParameters: SharesGetSharesToUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<UserShareInfo>>>;

    /**
     */
    sharesGetSharesToUser(userId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<UserShareInfo>>;

}

/**
 * 
 */
export class SharesApi extends runtime.BaseAPI implements SharesApiInterface {

    /**
     */
    async sharesCreateShareRaw(requestParameters: SharesCreateShareRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares/requests`,
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
    async sharesCreateShare(createShareRequest?: CreateShareRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.sharesCreateShareRaw({ createShareRequest: createShareRequest }, initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesDeleteRequestRaw(requestParameters: SharesDeleteRequestRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling sharesDeleteRequest().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares/requests/outgoing/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async sharesDeleteRequest(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.sharesDeleteRequestRaw({ id: id }, initOverrides);
    }

    /**
     */
    async sharesDenyRequestRaw(requestParameters: SharesDenyRequestRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling sharesDenyRequest().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares/requests/incoming/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async sharesDenyRequest(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.sharesDenyRequestRaw({ id: id }, initOverrides);
    }

    /**
     */
    async sharesGetIncomingRequestsListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareRequestBaseItem>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares/requests/incoming`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ShareRequestBaseItemFromJSON));
    }

    /**
     */
    async sharesGetIncomingRequestsList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareRequestBaseItem>> {
        const response = await this.sharesGetIncomingRequestsListRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesGetOutstandingRequestsListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ShareRequestBaseItem>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares/requests/outstanding`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ShareRequestBaseItemFromJSON));
    }

    /**
     */
    async sharesGetOutstandingRequestsList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ShareRequestBaseItem>> {
        const response = await this.sharesGetOutstandingRequestsListRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesGetRequestRaw(requestParameters: SharesGetRequestRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ShareRequestBaseDetails>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling sharesGetRequest().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares/requests/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ShareRequestBaseDetailsFromJSON(jsonValue));
    }

    /**
     */
    async sharesGetRequest(id: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ShareRequestBaseDetails> {
        const response = await this.sharesGetRequestRaw({ id: id }, initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesGetSharesByUsersRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<GenericIni>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(GenericIniFromJSON));
    }

    /**
     */
    async sharesGetSharesByUsers(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<GenericIni>> {
        const response = await this.sharesGetSharesByUsersRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async sharesGetSharesToUserRaw(requestParameters: SharesGetSharesToUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<UserShareInfo>>> {
        if (requestParameters['userId'] == null) {
            throw new runtime.RequiredError(
                'userId',
                'Required parameter "userId" was null or undefined when calling sharesGetSharesToUser().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shares/{userId}`.replace(`{${"userId"}}`, encodeURIComponent(String(requestParameters['userId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(UserShareInfoFromJSON));
    }

    /**
     */
    async sharesGetSharesToUser(userId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<UserShareInfo>> {
        const response = await this.sharesGetSharesToUserRaw({ userId: userId }, initOverrides);
        return await response.value();
    }

}
