import { FetchError, RateLimitError, ResponseError, parseRetryAfter } from './internal/errors';
import { client } from './internal/v1/client.gen';

client.interceptors.error.use((error, response, request) => {
  if (response) {
    const url = request?.url ?? '';
    const method = request?.method ?? '';
    const msg = `${method} ${url} → ${response.status}`;
    if (response.status === 429) {
      return new RateLimitError(response, parseRetryAfter(response), msg, error);
    }
    return new ResponseError(response, msg, error);
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
  adminAddEmailProviderBlacklist,
  adminAddUsernameBlacklist,
  adminAddWebhook,
  adminBulkCancelEmailOutbox,
  adminBulkDeleteEmailOutbox,
  adminBulkRequeueEmailOutbox,
  adminCancelEmailOutbox,
  adminConfigurationAdd,
  adminConfigurationDelete,
  adminConfigurationList,
  adminConfigurationUpdate,
  adminDeleteEmailOutbox,
  adminDeleteUser,
  adminGetEmailOutbox,
  adminGetEmailOutboxStats,
  adminGetOnlineDevices,
  adminGetUsers,
  adminListEmailProviderBlacklist,
  adminListUsernameBlacklist,
  adminListWebhooks,
  adminModifyUser,
  adminRemoveEmailProviderBlacklist,
  adminRemoveUsernameBlacklist,
  adminRemoveWebhook,
  adminRequeueEmailOutbox,
  adminSendTestEmail,
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
  sessionsGetSelfSession,
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
  usersGetByName,
  usersGetSelf,
  versionGetBackendInfo,
} from './internal/v1';

// Enum-like constants from v1 (each exports both a runtime value and a type).
export {
  ConfigurationValueType,
  EmailStatus,
  EmailType,
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
  EmailOutboxBulkResultDto,
  EmailOutboxMessageDto,
  EmailOutboxMessageDtoPaginated,
  EmailOutboxStatsDto,
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
  UserNameBlacklistDto,
  WebhookDto,
} from './internal/v1';

export {
  accountCheckUsername,
  accountLoginV2,
  accountPasswordResetInitiateV2,
  accountSignUpV2,
  devicesCreateDeviceV2,
  devicesGetLiveControlGatewayInfoV2,
  tokensCreateTokenV2,
  tokensEditTokenV2,
  tokensGetTokenByIdV2,
  tokensListTokensV2,
  tokensReportTokens,
  tokensSelfGetSelfTokenV2,
  tokensSetTokenPaused,
  userSharesCreateShareInvite,
  userSharesDeleteOutgoingInvite,
  userSharesDenyIncomingInvite,
  userSharesGetIncomingInvitesList,
  userSharesGetOutgoingInvitesList,
  userSharesGetSharesByUsers,
  userSharesRedeemInvite,
} from './internal/v2';

export { ControlLimitMode, UsernameAvailability, UsernameErrorType } from './internal/v2';

export type {
  CreateTokenRequestV2,
  DurationLimitSettings,
  EditTokenRequestV2,
  IntensityLimitSettings,
  LcgResponseV2,
  SetTokenPausedRequest,
  ShareInviteBaseDetails,
  ShockerControlSettings,
  ShockerLimits,
  ShockerPermLimitPairWithIdAndName,
  ShockerPermissions,
  TokenCreatedResponseV2,
  TokenPausedResponse,
  TokenResponseV2,
  UserShareInfo,
  UsernameCheckResponse,
  V2UserShares,
  V2UserSharesListItem,
} from './internal/v2';
