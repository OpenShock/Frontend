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
  DeviceSelfResponseBaseResponse,
  LcgNodeResponseBaseResponse,
  OpenShockProblem,
  StringBaseResponse,
} from '../models/index';
import {
    DeviceSelfResponseBaseResponseFromJSON,
    DeviceSelfResponseBaseResponseToJSON,
    LcgNodeResponseBaseResponseFromJSON,
    LcgNodeResponseBaseResponseToJSON,
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
    StringBaseResponseFromJSON,
    StringBaseResponseToJSON,
} from '../models/index';

export interface DevicePairRequest {
    pairCode: string;
}

export interface DevicePairDEPRECATEDRequest {
    pairCode: string;
}

/**
 * DeviceApi - interface
 * 
 * @export
 * @interface DeviceApiInterface
 */
export interface DeviceApiInterface {
    /**
     * 
     * @summary Gets the best suited LCG node for the client
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DeviceApiInterface
     */
    deviceGetLiveControlGatewayRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<LcgNodeResponseBaseResponse>>;

    /**
     * Gets the best suited LCG node for the client
     */
    deviceGetLiveControlGateway(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LcgNodeResponseBaseResponse>;

    /**
     * 
     * @summary Gets information about the authenticated device.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DeviceApiInterface
     */
    deviceGetSelfRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DeviceSelfResponseBaseResponse>>;

    /**
     * Gets information about the authenticated device.
     */
    deviceGetSelf(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DeviceSelfResponseBaseResponse>;

    /**
     * 
     * @summary Pair a device with a pair code.
     * @param {string} pairCode The pair code to pair with.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DeviceApiInterface
     */
    devicePairRaw(requestParameters: DevicePairRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<StringBaseResponse>>;

    /**
     * Pair a device with a pair code.
     */
    devicePair(pairCode: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<StringBaseResponse>;

    /**
     * 
     * @summary Pair a device with a pair code.
     * @param {string} pairCode The pair code to pair with.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DeviceApiInterface
     */
    devicePairDEPRECATEDRaw(requestParameters: DevicePairDEPRECATEDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<StringBaseResponse>>;

    /**
     * Pair a device with a pair code.
     */
    devicePairDEPRECATED(pairCode: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<StringBaseResponse>;

}

/**
 * 
 */
export class DeviceApi extends runtime.BaseAPI implements DeviceApiInterface {

    /**
     * Gets the best suited LCG node for the client
     */
    async deviceGetLiveControlGatewayRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<LcgNodeResponseBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/device/assignLCG`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LcgNodeResponseBaseResponseFromJSON(jsonValue));
    }

    /**
     * Gets the best suited LCG node for the client
     */
    async deviceGetLiveControlGateway(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LcgNodeResponseBaseResponse> {
        const response = await this.deviceGetLiveControlGatewayRaw(initOverrides);
        return await response.value();
    }

    /**
     * Gets information about the authenticated device.
     */
    async deviceGetSelfRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<DeviceSelfResponseBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/device/self`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DeviceSelfResponseBaseResponseFromJSON(jsonValue));
    }

    /**
     * Gets information about the authenticated device.
     */
    async deviceGetSelf(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<DeviceSelfResponseBaseResponse> {
        const response = await this.deviceGetSelfRaw(initOverrides);
        return await response.value();
    }

    /**
     * Pair a device with a pair code.
     */
    async devicePairRaw(requestParameters: DevicePairRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<StringBaseResponse>> {
        if (requestParameters['pairCode'] == null) {
            throw new runtime.RequiredError(
                'pairCode',
                'Required parameter "pairCode" was null or undefined when calling devicePair().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/device/pair/{pairCode}`.replace(`{${"pairCode"}}`, encodeURIComponent(String(requestParameters['pairCode']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => StringBaseResponseFromJSON(jsonValue));
    }

    /**
     * Pair a device with a pair code.
     */
    async devicePair(pairCode: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<StringBaseResponse> {
        const response = await this.devicePairRaw({ pairCode: pairCode }, initOverrides);
        return await response.value();
    }

    /**
     * Pair a device with a pair code.
     */
    async devicePairDEPRECATEDRaw(requestParameters: DevicePairDEPRECATEDRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<StringBaseResponse>> {
        if (requestParameters['pairCode'] == null) {
            throw new runtime.RequiredError(
                'pairCode',
                'Required parameter "pairCode" was null or undefined when calling devicePairDEPRECATED().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/pair/{pairCode}`.replace(`{${"pairCode"}}`, encodeURIComponent(String(requestParameters['pairCode']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => StringBaseResponseFromJSON(jsonValue));
    }

    /**
     * Pair a device with a pair code.
     */
    async devicePairDEPRECATED(pairCode: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<StringBaseResponse> {
        const response = await this.devicePairDEPRECATEDRaw({ pairCode: pairCode }, initOverrides);
        return await response.value();
    }

}
