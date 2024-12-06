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
  ControlRequest,
  ObjectBaseResponse,
  OpenShockProblem,
} from '../models/index';
import {
    ControlRequestFromJSON,
    ControlRequestToJSON,
    ObjectBaseResponseFromJSON,
    ObjectBaseResponseToJSON,
    OpenShockProblemFromJSON,
    OpenShockProblemToJSON,
} from '../models/index';

export interface ShockerSendControlRequest {
    controlRequest?: ControlRequest;
}

/**
 * ShockerApi - interface
 * 
 * @export
 * @interface ShockerApiInterface
 */
export interface ShockerApiInterface {
    /**
     * 
     * @summary Send a control message to shockers
     * @param {ControlRequest} [controlRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShockerApiInterface
     */
    shockerSendControlRaw(requestParameters: ShockerSendControlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>>;

    /**
     * Send a control message to shockers
     */
    shockerSendControl(controlRequest?: ControlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse>;

}

/**
 * 
 */
export class ShockerApi extends runtime.BaseAPI implements ShockerApiInterface {

    /**
     * Send a control message to shockers
     */
    async shockerSendControlRaw(requestParameters: ShockerSendControlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ObjectBaseResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["OpenShockToken"] = await this.configuration.apiKey("OpenShockToken"); // ApiToken authentication
        }

        const response = await this.request({
            path: `/2/shockers/control`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControlRequestToJSON(requestParameters['controlRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ObjectBaseResponseFromJSON(jsonValue));
    }

    /**
     * Send a control message to shockers
     */
    async shockerSendControl(controlRequest?: ControlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ObjectBaseResponse> {
        const response = await this.shockerSendControlRaw({ controlRequest: controlRequest }, initOverrides);
        return await response.value();
    }

}
