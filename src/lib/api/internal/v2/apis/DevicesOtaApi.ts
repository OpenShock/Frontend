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
  OpenShockProblem,
  OtaItemIReadOnlyCollectionBaseResponse,
} from '../models/index';
import {
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
    OtaItemIReadOnlyCollectionBaseResponseFromJSON,
    OtaItemIReadOnlyCollectionBaseResponseToJSON,
} from '../models/index';

export interface DevicesOtaGetOtaUpdateHistoryRequest {
    deviceId: string;
}

/**
 * DevicesOtaApi - interface
 * 
 * @export
 * @interface DevicesOtaApiInterface
 */
export interface DevicesOtaApiInterface {
    /**
     * 
     * @summary Gets the OTA update history for a device
     * @param {string} deviceId Id of the device
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DevicesOtaApiInterface
     */
    devicesOtaGetOtaUpdateHistoryRaw(requestParameters: DevicesOtaGetOtaUpdateHistoryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<OtaItemIReadOnlyCollectionBaseResponse>>;

    /**
     * Gets the OTA update history for a device
     */
    devicesOtaGetOtaUpdateHistory(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<OtaItemIReadOnlyCollectionBaseResponse>;

}

/**
 * 
 */
export class DevicesOtaApi extends runtime.BaseAPI implements DevicesOtaApiInterface {

    /**
     * Gets the OTA update history for a device
     */
    async devicesOtaGetOtaUpdateHistoryRaw(requestParameters: DevicesOtaGetOtaUpdateHistoryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<OtaItemIReadOnlyCollectionBaseResponse>> {
        if (requestParameters['deviceId'] == null) {
            throw new runtime.RequiredError(
                'deviceId',
                'Required parameter "deviceId" was null or undefined when calling devicesOtaGetOtaUpdateHistory().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/{deviceId}/ota`.replace(`{${"deviceId"}}`, encodeURIComponent(String(requestParameters['deviceId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => OtaItemIReadOnlyCollectionBaseResponseFromJSON(jsonValue));
    }

    /**
     * Gets the OTA update history for a device
     */
    async devicesOtaGetOtaUpdateHistory(deviceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<OtaItemIReadOnlyCollectionBaseResponse> {
        const response = await this.devicesOtaGetOtaUpdateHistoryRaw({ deviceId: deviceId }, initOverrides);
        return await response.value();
    }

}
