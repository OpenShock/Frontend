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
  DeviceEdit,
  GuidBaseResponse,
  LcgResponseBaseResponse,
  ObjectBaseResponse,
  OpenShockProblem,
  OtaItemIReadOnlyCollectionBaseResponse,
  ResponseDeviceIEnumerableBaseResponse,
  ResponseDeviceWithTokenBaseResponse,
  ShockerResponseIEnumerableBaseResponse,
  StringBaseResponse,
} from '../models/index';
import {
    DeviceEditFromJSON,
    DeviceEditToJSON,
    GuidBaseResponseFromJSON,
    GuidBaseResponseToJSON,
    LcgResponseBaseResponseFromJSON,
    LcgResponseBaseResponseToJSON,
    ObjectBaseResponseFromJSON,
    ObjectBaseResponseToJSON,
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
    OtaItemIReadOnlyCollectionBaseResponseFromJSON,
    OtaItemIReadOnlyCollectionBaseResponseToJSON,
    ResponseDeviceIEnumerableBaseResponseFromJSON,
    ResponseDeviceIEnumerableBaseResponseToJSON,
    ResponseDeviceWithTokenBaseResponseFromJSON,
    ResponseDeviceWithTokenBaseResponseToJSON,
    ShockerResponseIEnumerableBaseResponseFromJSON,
    ShockerResponseIEnumerableBaseResponseToJSON,
    StringBaseResponseFromJSON,
    StringBaseResponseToJSON,
} from '../models/index';

export interface DevicesEditDeviceRequest {
    deviceId: string;
    deviceEdit?: DeviceEdit;
}

export interface DevicesGetDeviceByIdRequest {
    deviceId: string;
}

export interface DevicesGetLiveControlGatewayInfoRequest {
    deviceId: string;
}

export interface DevicesGetOtaUpdateHistoryRequest {
    deviceId: string;
}

export interface DevicesGetPairCodeRequest {
    deviceId: string;
}

export interface DevicesGetShockersRequest {
    deviceId: string;
}

export interface DevicesRegenerateDeviceTokenRequest {
    deviceId: string;
}

export interface DevicesRemoveDeviceRequest {
    deviceId: string;
}

/**
 * DevicesApi - interface
 * 
 * @export
 * @interface DevicesApiInterface
 */
export interface DevicesApiInterface {
    /**
     * 
     * @summary Create a new device for the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesCreateDeviceRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GuidBaseResponse>>;

    /**
     * Create a new device for the current user
     */
    devicesCreateDevice(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GuidBaseResponse>;

    /**
     * 
     * @summary Edit a device
     * @param {string} deviceId 
     * @param {DeviceEdit} [deviceEdit] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesEditDeviceRaw(requestParameters: DevicesEditDeviceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Edit a device
     */
    devicesEditDevice(deviceId: string, deviceEdit?: DeviceEdit, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Get a device by its id
     * @param {string} deviceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesGetDeviceByIdRaw(requestParameters: DevicesGetDeviceByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ResponseDeviceWithTokenBaseResponse>>;

    /**
     * Get a device by its id
     */
    devicesGetDeviceById(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ResponseDeviceWithTokenBaseResponse>;

    /**
     * 
     * @summary Get LCG info for a device if it is online and connected to a LCG node
     * @param {string} deviceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesGetLiveControlGatewayInfoRaw(requestParameters: DevicesGetLiveControlGatewayInfoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<LcgResponseBaseResponse>>;

    /**
     * Get LCG info for a device if it is online and connected to a LCG node
     */
    devicesGetLiveControlGatewayInfo(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LcgResponseBaseResponse>;

    /**
     * 
     * @summary Gets the OTA update history for a device
     * @param {string} deviceId Id of the device
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesGetOtaUpdateHistoryRaw(requestParameters: DevicesGetOtaUpdateHistoryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<OtaItemIReadOnlyCollectionBaseResponse>>;

    /**
     * Gets the OTA update history for a device
     */
    devicesGetOtaUpdateHistory(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<OtaItemIReadOnlyCollectionBaseResponse>;

    /**
     * 
     * @summary Get a pair code for a device
     * @param {string} deviceId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesGetPairCodeRaw(requestParameters: DevicesGetPairCodeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<StringBaseResponse>>;

    /**
     * Get a pair code for a device
     */
    devicesGetPairCode(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<StringBaseResponse>;

    /**
     * 
     * @summary Get all shockers for a device
     * @param {string} deviceId The device id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesGetShockersRaw(requestParameters: DevicesGetShockersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ShockerResponseIEnumerableBaseResponse>>;

    /**
     * Get all shockers for a device
     */
    devicesGetShockers(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ShockerResponseIEnumerableBaseResponse>;

    /**
     * 
     * @summary Get all devices for the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesListDevicesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ResponseDeviceIEnumerableBaseResponse>>;

    /**
     * Get all devices for the current user
     */
    devicesListDevices(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ResponseDeviceIEnumerableBaseResponse>;

    /**
     * 
     * @summary Regenerate a device token
     * @param {string} deviceId The id of the device to regenerate the token for
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesRegenerateDeviceTokenRaw(requestParameters: DevicesRegenerateDeviceTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Regenerate a device token
     */
    devicesRegenerateDeviceToken(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

    /**
     * 
     * @summary Remove a device from current user\'s account
     * @param {string} deviceId The id of the device to delete
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesApiInterface
     */
    devicesRemoveDeviceRaw(requestParameters: DevicesRemoveDeviceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Remove a device from current user\'s account
     */
    devicesRemoveDevice(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

}

/**
 * 
 */
export class DevicesApi extends runtime.BaseAPI implements DevicesApiInterface {

    /**
     * Create a new device for the current user
     */
    async devicesCreateDeviceRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GuidBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GuidBaseResponseFromJSON(jsonValue));
    }

    /**
     * Create a new device for the current user
     */
    async devicesCreateDevice(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GuidBaseResponse> {
        const response = await this.devicesCreateDeviceRaw(initOverrides);
        return await response.value();
    }

    /**
     * Edit a device
     */
    async devicesEditDeviceRaw(requestParameters: DevicesEditDeviceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesEditDevice.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: DeviceEditToJSON(requestParameters.deviceEdit),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Edit a device
     */
    async devicesEditDevice(deviceId: string, deviceEdit?: DeviceEdit, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.devicesEditDeviceRaw({ deviceId: deviceId, deviceEdit: deviceEdit }, initOverrides);
        return await response.value();
    }

    /**
     * Get a device by its id
     */
    async devicesGetDeviceByIdRaw(requestParameters: DevicesGetDeviceByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ResponseDeviceWithTokenBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesGetDeviceById.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ResponseDeviceWithTokenBaseResponseFromJSON(jsonValue));
    }

    /**
     * Get a device by its id
     */
    async devicesGetDeviceById(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ResponseDeviceWithTokenBaseResponse> {
        const response = await this.devicesGetDeviceByIdRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

    /**
     * Get LCG info for a device if it is online and connected to a LCG node
     */
    async devicesGetLiveControlGatewayInfoRaw(requestParameters: DevicesGetLiveControlGatewayInfoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<LcgResponseBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesGetLiveControlGatewayInfo.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}/lcg`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LcgResponseBaseResponseFromJSON(jsonValue));
    }

    /**
     * Get LCG info for a device if it is online and connected to a LCG node
     */
    async devicesGetLiveControlGatewayInfo(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LcgResponseBaseResponse> {
        const response = await this.devicesGetLiveControlGatewayInfoRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

    /**
     * Gets the OTA update history for a device
     */
    async devicesGetOtaUpdateHistoryRaw(requestParameters: DevicesGetOtaUpdateHistoryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<OtaItemIReadOnlyCollectionBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesGetOtaUpdateHistory.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}/ota`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => OtaItemIReadOnlyCollectionBaseResponseFromJSON(jsonValue));
    }

    /**
     * Gets the OTA update history for a device
     */
    async devicesGetOtaUpdateHistory(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<OtaItemIReadOnlyCollectionBaseResponse> {
        const response = await this.devicesGetOtaUpdateHistoryRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

    /**
     * Get a pair code for a device
     */
    async devicesGetPairCodeRaw(requestParameters: DevicesGetPairCodeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<StringBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesGetPairCode.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}/pair`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => StringBaseResponseFromJSON(jsonValue));
    }

    /**
     * Get a pair code for a device
     */
    async devicesGetPairCode(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<StringBaseResponse> {
        const response = await this.devicesGetPairCodeRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

    /**
     * Get all shockers for a device
     */
    async devicesGetShockersRaw(requestParameters: DevicesGetShockersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ShockerResponseIEnumerableBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesGetShockers.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}/shockers`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ShockerResponseIEnumerableBaseResponseFromJSON(jsonValue));
    }

    /**
     * Get all shockers for a device
     */
    async devicesGetShockers(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ShockerResponseIEnumerableBaseResponse> {
        const response = await this.devicesGetShockersRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

    /**
     * Get all devices for the current user
     */
    async devicesListDevicesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ResponseDeviceIEnumerableBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ResponseDeviceIEnumerableBaseResponseFromJSON(jsonValue));
    }

    /**
     * Get all devices for the current user
     */
    async devicesListDevices(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ResponseDeviceIEnumerableBaseResponse> {
        const response = await this.devicesListDevicesRaw(initOverrides);
        return await response.value();
    }

    /**
     * Regenerate a device token
     */
    async devicesRegenerateDeviceTokenRaw(requestParameters: DevicesRegenerateDeviceTokenRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesRegenerateDeviceToken.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Regenerate a device token
     */
    async devicesRegenerateDeviceToken(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.devicesRegenerateDeviceTokenRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

    /**
     * Remove a device from current user\'s account
     */
    async devicesRemoveDeviceRaw(requestParameters: DevicesRemoveDeviceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        if (requestParameters.deviceId === null || requestParameters.deviceId === undefined) {
            throw new runtime.RequiredError('deviceId','Required parameter requestParameters.deviceId was null or undefined when calling devicesRemoveDevice.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // OpenShockToken authentication
        }

        const response = await this.request({
            path: `/1/devices/{deviceId}`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters.deviceId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Remove a device from current user\'s account
     */
    async devicesRemoveDevice(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.devicesRemoveDeviceRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

}
