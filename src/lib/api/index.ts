import { FetchError, RateLimitError, ResponseError, parseRetryAfter } from './internal/errors';
import { client } from './internal/v1/client.gen';

client.interceptors.error.use((error, response, request) => {
  if (response) {
    const url = request?.url ?? '';
    const method = request?.method ?? '';
    const msg = `${method} ${url} → ${response.status}`;
    if (response.status === 429) {
      return new RateLimitError(response, parseRetryAfter(response), msg);
    }
    return new ResponseError(response, msg);
  }
  if (error instanceof Error) return new FetchError(error, error.message);
  return new FetchError(new Error(String(error)), 'Unknown fetch error');
});

export { FetchError, RateLimitError, ResponseError } from './internal/errors';

// One canonical version per method. v2 wins where both exist.
export {
  accountActivate,
  accountEmailVerify,
  accountLogout,
  accountPasswordResetCheckValid,
  accountPasswordResetComplete,
  accountPasswordResetInitiate,
  adminAddEmailProviderBlacklist,
  adminAddUsernameBlacklist,
  adminAddWebhook,
  adminConfigurationAdd,
  adminConfigurationDelete,
  adminConfigurationList,
  adminConfigurationUpdate,
  adminGetOnlineDevices,
  adminGetUsers,
  adminListEmailProviderBlacklist,
  adminListUsernameBlacklist,
  adminListWebhooks,
  adminModifyUser,
  adminRemoveEmailProviderBlacklist,
  adminRemoveUsernameBlacklist,
  adminRemoveWebhook,
  authenticatedAccountChangeEmail,
  authenticatedAccountChangePassword,
  authenticatedAccountChangeUsername,
  authenticatedAccountDeactivate,
  authenticatedAccountListOAuthConnections,
  authenticatedAccountRemoveOAuthConnection,
  devicesEditDevice,
  devicesGetLiveControlGatewayInfo,
  devicesGetPairCode,
  devicesOtaGetOtaUpdateHistory,
  devicesRegenerateDeviceToken,
  devicesRemoveDevice,
  publicGetOnlineDevicesStatistics,
  publicGetPublicShare,
  sessionsDeleteSession,
  sessionsListSessions,
  shareLinksAddShocker,
  shareLinksCreatePublicShare,
  shareLinksDeletePublicShare,
  shareLinksEditShocker,
  shareLinksList,
  shareLinksPauseShocker,
  shareLinksRemoveShocker,
  shockerEditShocker,
  shockerGetAllShockerLogs,
  shockerGetShockerById,
  shockerGetShockerLogs,
  shockerListSharedShockers,
  shockerListShockers,
  shockerPauseShocker,
  shockerRegisterShocker,
  shockerRemoveShocker,
  shockerShockerShareCodePause,
  shockerShockerShareCodeUpdate,
  shockerShockerShareRemove,
  tokenDeleteDeleteToken,
  tokensCreateToken,
  tokensEditToken,
  tokensListTokens,
  tokensReportTokens,
  usersGetByName,
  usersGetSelf,
  versionGetBackendInfo,
} from './internal/v1';

// Enum-like constants from v1 (each exports both a runtime value and a type).
export {
  ConfigurationValueType,
  MatchTypeEnum,
  OtaUpdateStatus,
  PasswordHashingAlgorithm,
  PermissionType,
  RoleType,
  ShockerModelType,
} from './internal/v1';

export type {
  AdminOnlineDeviceResponse,
  AdminUsersView,
  AdminUsersViewPaginated,
  BackendInfoResponse,
  BasicUserInfo,
  BooleanLegacyDataResponse,
  ConfigurationItemDto,
  DeviceWithShockersResponse,
  EmailProviderBlacklistDto,
  LogEntry,
  LogEntryWithHub,
  LoginSessionResponse,
  NewShocker,
  OAuthConnectionResponse,
  OtaItem,
  OwnPublicShareResponse,
  OwnerShockerResponse,
  PublicShareDevice,
  PublicShareResponse,
  PublicShareShocker,
  SharedShocker,
  ShockerResponse,
  ShockerWithDevice,
  TokenCreatedResponse,
  TokenResponse,
  UserNameBlacklistDto,
  WebhookDto,
} from './internal/v1';

export {
  accountCheckUsername,
  accountLoginV2,
  accountSignUpV2,
  devicesCreateDeviceV2,
  userSharesCreateShareInvite,
  userSharesDeleteOutgoingInvite,
  userSharesDenyIncomingInvite,
  userSharesGetIncomingInvitesList,
  userSharesGetOutgoingInvitesList,
  userSharesGetSharesByUsers,
  userSharesRedeemInvite,
} from './internal/v2';

export { UsernameAvailability, UsernameErrorType } from './internal/v2';

export type {
  ShareInviteBaseDetails,
  ShockerLimits,
  ShockerPermLimitPairWithIdAndName,
  ShockerPermissions,
  UserShareInfo,
  UsernameCheckResponse,
  V2UserShares,
  V2UserSharesListItem,
} from './internal/v2';
