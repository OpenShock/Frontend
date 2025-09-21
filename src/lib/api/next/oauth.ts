import { GetBackendUrl, GetJson, PostJson } from './base';
import type { LoginOkResponse, OAuthFinalizeRequest, OAuthSignupData } from './models';
import { TransformLoginOkResponse, TransformOAuthSignupData } from './transformers';

export function GetOAuthAuthorizeUrl(provider: string, flow: 'LoginOrCreate' | 'Link') {
  const providerEnc = encodeURIComponent(provider);
  const flowEnc = encodeURIComponent(flow);
  return GetBackendUrl(`/1/oauth/${providerEnc}/authorize?flow=${flowEnc}`);
}

export async function OAuthSignupGetData(provider: string) {
  const providerEnc = encodeURIComponent(provider);
  return GetJson<OAuthSignupData>(
    `/1/oauth/${providerEnc}/signup-data`,
    200,
    TransformOAuthSignupData
  );
}

export async function OAuthSignupFinalize(
  provider: string,
  payload: OAuthFinalizeRequest
): Promise<LoginOkResponse> {
  const providerEnc = encodeURIComponent(provider);
  return PostJson(
    `/1/oauth/${providerEnc}/signup-finalize`,
    payload,
    200,
    TransformLoginOkResponse
  );
}
