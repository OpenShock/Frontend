import { getBackendURL } from '$lib/utils/url';
import { GetJson, PostJson } from './base';
import type { LoginOkResponse, OAuthFinalizeRequest, OAuthSignupData } from './models';
import { TransformLoginOkResponse, TransformOAuthSignupData } from './transformers';

export function GetOAuthAuthorizeUrl(provider: string, flow: 'LoginOrCreate' | 'Link'): string {
  const url = getBackendURL(`1/oauth/${encodeURIComponent(provider)}/authorize`);

  url.searchParams.set('flow', flow);

  return url.href;
}

export async function OAuthSignupGetData(provider: string) {
  return GetJson<OAuthSignupData>(
    `1/oauth/${encodeURIComponent(provider)}/signup-data`,
    200,
    TransformOAuthSignupData
  );
}

export async function OAuthSignupFinalize(
  provider: string,
  payload: OAuthFinalizeRequest
): Promise<LoginOkResponse> {
  return PostJson(
    `1/oauth/${encodeURIComponent(provider)}/signup-finalize`,
    payload,
    200,
    TransformLoginOkResponse
  );
}
