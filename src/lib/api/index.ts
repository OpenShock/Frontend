import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import {
  APITokensApi,
  AccountApi as AccountV1Api,
  AdminApi,
  type ConfigurationParameters,
  Configuration as ConfigurationV1,
  HubManagementApi as HubManagementV1Api,
  MetaApi,
  PublicShockerSharesApi,
  SessionsApi,
  ShockerSharesApi as ShockerSharesV1Api,
  ShockersApi as ShockersV1Api,
  UsersApi,
} from './internal/v1';
import {
  AccountApi as AccountV2Api,
  Configuration as ConfigurationV2,
  HubManagementApi as HubManagementV2Api,
  UserShockerSharesApi as ShockerSharesV2Api,
  ShockersApi as ShockersV2Api,
} from './internal/v2';

function GetBasePath() {
  if (!PUBLIC_BACKEND_API_URL) {
    throw new Error('PUBLIC_BACKEND_API_URL is not set in the environment');
  }

  try {
    const parsedUrl = new URL(PUBLIC_BACKEND_API_URL);
    // Remove trailing slash unless the path is just "/"
    let basePath = parsedUrl.toString();
    if (basePath.endsWith('/') && basePath.length > parsedUrl.origin.length + 1) {
      basePath = basePath.slice(0, -1);
    }
    return basePath;
  } catch (error: any) {
    throw new Error('PUBLIC_BACKEND_API_URL is not a valid URL', { cause: error });
  }
}

function GetConfig(): ConfigurationParameters {
  return {
    basePath: GetBasePath(),
    credentials: 'include',
  };
}

const DefaultApiV1Configuration = new ConfigurationV1(GetConfig());
const DefaultApiV2Configuration = new ConfigurationV2(GetConfig());

export const accountV1Api = new AccountV1Api(DefaultApiV1Configuration);
export const accountV2Api = new AccountV2Api(DefaultApiV2Configuration);
export const adminApi = new AdminApi(DefaultApiV1Configuration);
export const apiTokensApi = new APITokensApi(DefaultApiV1Configuration);
export const hubManagementV1Api = new HubManagementV1Api(DefaultApiV1Configuration);
export const hubManagementV2Api = new HubManagementV2Api(DefaultApiV2Configuration);
export const metaApi = new MetaApi(DefaultApiV1Configuration);
export const sessionsApi = new SessionsApi(DefaultApiV1Configuration);
export const shockersV1Api = new ShockersV1Api(DefaultApiV1Configuration);
export const shockersV2Api = new ShockersV2Api(DefaultApiV2Configuration);
export const publicShockerSharesApi = new PublicShockerSharesApi(DefaultApiV1Configuration);
export const shockerSharesV1Api = new ShockerSharesV1Api(DefaultApiV1Configuration);
export const shockerSharesV2Api = new ShockerSharesV2Api(DefaultApiV2Configuration);
export const usersApi = new UsersApi(DefaultApiV1Configuration);
