import { PUBLIC_BACKEND_API_DOMAIN } from '$env/static/public';
import {
  AccountApi as AccountV1Api,
  AdminApi,
  APITokensApi,
  Configuration as ConfigurationV1,
  HubManagementApi as HubManagementV1Api,
  MetaApi,
  SessionsApi,
  ShockersApi as ShockersV1Api,
  ShockerShareLinksApi,
  ShockerSharesApi as ShockerSharesV1Api,
  UsersApi,
} from './internal/v1';
import {
  AccountApi as AccountV2Api,
  Configuration as ConfigurationV2,
  HubManagementApi as HubManagementV2Api,
  ShockersApi as ShockersV2Api,
  ShockerSharesApi as ShockerSharesV2Api,
} from './internal/v2';

type Config = {
  basePath?: string;
  credentials?: RequestCredentials;
};

function GetBasePath() {
  const domain = (PUBLIC_BACKEND_API_DOMAIN || undefined) as string | undefined;

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
    credentials: 'include',
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
export const shockerShareLinksApi = new ShockerShareLinksApi(DefaultApiV1Configuration);
export const shockerSharesV1Api = new ShockerSharesV1Api(DefaultApiV1Configuration);
export const shockerSharesV2Api = new ShockerSharesV2Api(DefaultApiV2Configuration);
export const usersApi = new UsersApi(DefaultApiV1Configuration);
