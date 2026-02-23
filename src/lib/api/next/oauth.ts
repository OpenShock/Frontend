import { getBackendURL } from '$lib/utils/url';
import { GetJson, PostJson } from './base';
import type { LoginOkResponse, OAuthFinalizeRequest, OAuthSignupData } from './models';
import { TransformLoginOkResponse, TransformOAuthSignupData } from './transformers';

export function GetOAuthAuthorizeUrl(provider: string, flow: 'LoginOrCreate' | 'Link'): string {
  const providerEnc = encodeURIComponent(provider);
  const flowEnc = encodeURIComponent(flow);
  return getBackendURL(`1/oauth/${providerEnc}/authorize?flow=${flowEnc}`).href;
}

export async function OAuthSignupGetData(provider: string) {
  const providerEnc = encodeURIComponent(provider);
  return GetJson<OAuthSignupData>(
    `1/oauth/${providerEnc}/signup-data`,
    200,
    TransformOAuthSignupData
  );
}

export async function OAuthSignupFinalize(
  provider: string,
  payload: OAuthFinalizeRequest
): Promise<LoginOkResponse> {
  const providerEnc = encodeURIComponent(provider);
  return PostJson(`1/oauth/${providerEnc}/signup-finalize`, payload, 200, TransformLoginOkResponse);
}
