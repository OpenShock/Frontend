import { PUBLIC_BACKEND_API_DOMAIN } from '$env/static/public';
import { AccountApi, AdminApi, AuthenticatedAccountApi, Configuration as ConfigurationV1, DeviceApi, DevicesApi, PublicApi, ShareLinksApi, SharesApi, ShockerApi as ShockerV1Api, TokensApi, UsersApi, VersionApi } from './internal/v1';
import { Configuration as ConfigurationV2, ShockerApi as ShockerV2Api } from './internal/v2';

type Config = {
  basePath?: string;
  credentials?: RequestCredentials;
};

function GetBasePath() {
  let domain = (PUBLIC_BACKEND_API_DOMAIN || undefined) as string | undefined;

  if (!domain) {
    return undefined;
  }

  if (!/^[a-z0-9.-]+$/i.test(domain)) {
    return undefined;
  }

  return 'https://' + domain; // TODO: Add configurable protocol
}

function GetConfig(): Config {
  return {
    basePath: GetBasePath(),
    credentials: 'include'
  };
}

export function GetV1Config() {
  return new ConfigurationV1(GetConfig());
}

export function GetV2Config() {
  return new ConfigurationV2(GetConfig());
}

const DefaultApiV1Configuration = GetV1Config();
const DefaultApiV2Configuration = GetV2Config();

export const accountApi = new AccountApi(DefaultApiV1Configuration);
export const authenticatedAccountApi = new AuthenticatedAccountApi(DefaultApiV1Configuration);
export const adminApi = new AdminApi(DefaultApiV1Configuration);
export const deviceApi = new DeviceApi(DefaultApiV1Configuration);
export const devicesApi = new DevicesApi(DefaultApiV1Configuration);
export const publicApi = new PublicApi(DefaultApiV1Configuration);
export const shareLinksApi = new ShareLinksApi(DefaultApiV1Configuration);
export const sharesApi = new SharesApi(DefaultApiV1Configuration);
export const shockerV1Api = new ShockerV1Api(DefaultApiV1Configuration);
export const shockerV2Api = new ShockerV2Api(DefaultApiV2Configuration);
export const tokensApi = new TokensApi(DefaultApiV1Configuration);
export const usersApi = new UsersApi(DefaultApiV1Configuration);
export const versionApi = new VersionApi(DefaultApiV1Configuration);