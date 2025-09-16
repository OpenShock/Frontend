import { GetBackendUrl, GetJson, PostJson } from './base';
import type { LoginOkResponse, OAuthFinalizeRequest, OAuthSignupData } from './models';
import {
  TransformLoginOkResponse,
  TransformOAuthSignupData,
  ValidateStringArray,
} from './transformers';

export function OAuthListProviders(): Promise<string[]> {
  return GetJson<string[]>('/1/oauth/providers', 200, ValidateStringArray);
}

export function GetOAuthAuthorizeUrl(provider: string, flow: 'LoginOrCreate' | 'Link') {
  const providerEnc = encodeURIComponent(provider);
  const flowEnc = encodeURIComponent(flow);
  return GetBackendUrl(`/1/oauth/${providerEnc}/authorize?flow=${flowEnc}`);
}

export async function OAuthSignupGetData(provider: string) {
  const providerEnc = encodeURIComponent(provider);
  return GetJson<OAuthSignupData>(`/1/oauth/${providerEnc}/data`, 200, TransformOAuthSignupData);
}

export async function OAuthSignupFinalize(
  provider: string,
  payload: OAuthFinalizeRequest
): Promise<LoginOkResponse> {
  const providerEnc = encodeURIComponent(provider);
  return PostJson(`/1/oauth/${providerEnc}/finalize`, payload, 200, TransformLoginOkResponse);
}
