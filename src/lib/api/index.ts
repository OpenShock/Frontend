import { env } from '$env/dynamic/public';
import { AccountApi, AdminApi, Configuration as ConfigurationV1, DeviceApi, DevicesApi, PublicApi, ShareLinksApi, SharesApi, ShockerApi as ShockerV1Api, TokensApi, UsersApi, VersionApi } from './internal/v1';
import { Configuration as ConfigurationV2, ShockerApi as ShockerV2Api } from './internal/v2';

export const DefaultApiV1Configuration = new ConfigurationV1({
  basePath: env.PUBLIC_BACKEND_API_BASE_URL,
  credentials: 'include'
});
export const DefaultApiV2Configuration = new ConfigurationV2({
  basePath: env.PUBLIC_BACKEND_API_BASE_URL,
  credentials: 'include'
});

export const accountApi = new AccountApi(DefaultApiV1Configuration);
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
