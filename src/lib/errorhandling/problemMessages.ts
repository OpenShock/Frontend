import { m } from '#lib/paraglide/messages.js';
import type { ProblemType, ProblemTypes } from './problemTypes';

type Message = () => string;

/**
 * Translated copy for each problem type, one entry per field the registry fills.
 * Referencing each message directly lets the bundler drop every message the app never uses.
 * A lookup by computed key would keep all of them, in every locale.
 */
export const ProblemMessages: {
  [T in ProblemType]: {
    [F in keyof (typeof ProblemTypes)[T]]: Message;
  };
} = {
  'Account.AccountNotActivated': {
    title: m.problem_account_account_not_activated_title,
    description: m.problem_account_account_not_activated_desc,
  },
  'Account.Activation.NotFound': {
    title: m.problem_account_activation_not_found_title,
    description: m.problem_account_activation_not_found_desc,
  },
  'Account.Activation.ResendTooMany': {
    title: m.problem_account_activation_resend_too_many_title,
    description: m.problem_account_activation_resend_too_many_desc,
  },
  'Account.Activation.ResendUnavailable': {
    title: m.problem_account_activation_resend_unavailable_title,
    description: m.problem_account_activation_resend_unavailable_desc,
  },
  'Account.Deactivate.AlreadyDeactivated': {
    title: m.problem_account_deactivate_already_deactivated_title,
  },
  'Account.Deactivate.DeniedPrivileged': {
    title: m.problem_account_deactivate_denied_privileged_title,
  },
  'Account.Deactivate.Unauthorized': { title: m.problem_account_deactivate_unauthorized_title },
  'Account.Deactivated': { title: m.problem_account_deactivated_title },
  'Account.Email.AlreadyInUse': { title: m.problem_account_email_already_in_use_title },
  'Account.Email.Invalid': { title: m.problem_account_email_invalid_title },
  'Account.Email.Taken': { title: m.problem_account_email_taken_title },
  'Account.Email.TooManyRequests': {
    title: m.problem_account_email_too_many_requests_title,
    description: m.problem_account_email_too_many_requests_desc,
  },
  'Account.Email.Unchanged': { title: m.problem_account_email_unchanged_title },
  'Account.Email.VerifyNotFound': {
    title: m.problem_account_email_verify_not_found_title,
    description: m.problem_account_email_verify_not_found_desc,
  },
  'Account.OAuthOnly': {
    title: m.problem_account_o_auth_only_title,
    description: m.problem_account_o_auth_only_desc,
  },
  'Account.Password.NotSet': {
    title: m.problem_account_password_not_set_title,
    description: m.problem_account_password_not_set_desc,
  },
  'Account.Password.OldPasswordInvalid': {
    title: m.problem_account_password_old_password_invalid_title,
  },
  'Account.Username.Invalid': { title: m.problem_account_username_invalid_title },
  'Account.Username.RecentlyChanged': {
    title: m.problem_account_username_recently_changed_title,
    description: m.problem_account_username_recently_changed_desc,
  },
  'Account.Username.Taken': { title: m.problem_account_username_taken_title },
  'Admin.User.Deactivated': { title: m.problem_admin_user_deactivated_title },
  'Admin.User.NotActivated': { title: m.problem_admin_user_not_activated_title },
  'ApiToken.CanOnlyDeleteSelf': { title: m.problem_api_token_can_only_delete_self_title },
  'ApiToken.NotFound': { title: m.problem_api_token_not_found_title },
  'ApiToken.Paused': { title: m.problem_api_token_paused_title },
  'AssignLcg.BadSchemaVersion': {},
  'AssignLcg.NoLcgAvailable': {},
  'Authentication.AccountDeactivated': {
    title: m.problem_authentication_account_deactivated_title,
  },
  'Authentication.AccountNotActivated': {
    title: m.problem_authentication_account_not_activated_title,
  },
  'Authentication.CookieMissingOrInvalid': {
    title: m.problem_authentication_cookie_missing_or_invalid_title,
    description: m.problem_authentication_cookie_missing_or_invalid_desc,
  },
  'Authentication.HeaderMissingOrInvalid': {
    title: m.problem_authentication_header_missing_or_invalid_title,
  },
  'Authentication.SessionInvalid': {
    title: m.problem_authentication_session_invalid_title,
    description: m.problem_authentication_session_invalid_desc,
  },
  'Authentication.TokenInvalid': { title: m.problem_authentication_token_invalid_title },
  'Authentication.UnknownError': { title: m.problem_authentication_unknown_error_title },
  'Authorization.Policy.NotMet': { title: m.problem_authorization_policy_not_met_title },
  'Authorization.Token.Only': { title: m.problem_authorization_token_only_title },
  'Authorization.Token.PermissionMissing': {
    title: m.problem_authorization_token_permission_missing_title,
  },
  'Authorization.UnknownError': { title: m.problem_authorization_unknown_error_title },
  'Authorization.UserSession.Only': { title: m.problem_authorization_user_session_only_title },
  'AutomationToken.NotAllowedForAccount': {
    title: m.problem_automation_token_not_allowed_for_account_title,
  },
  'Configuration.AlreadyExists': { title: m.problem_configuration_already_exists_title },
  'Configuration.InvalidNameFormat': {
    title: m.problem_configuration_invalid_name_format_title,
    description: m.problem_configuration_invalid_name_format_desc,
  },
  'Configuration.InvalidValueFormat': { title: m.problem_configuration_invalid_value_format_title },
  'Configuration.NotFound': { title: m.problem_configuration_not_found_title },
  'ControlStats.InvalidRange': { title: m.problem_control_stats_invalid_range_title },
  'ControlStats.InvalidTimeZone': { title: m.problem_control_stats_invalid_time_zone_title },
  'ControlStats.MissingCapability': {},
  'Device.NotFound': { title: m.problem_device_not_found_title },
  'Device.NotOnline': { title: m.problem_device_not_online_title },
  'Device.TooManyHubs': { title: m.problem_device_too_many_hubs_title },
  'Device.TooManyShockers': { title: m.problem_device_too_many_shockers_title },
  'Endpoint.Retired': { title: m.problem_endpoint_retired_title },
  ExpressionError: { title: m.problem_expression_error_title },
  InternalServerError: { title: m.problem_internal_server_error_title },
  'Login.InvalidCredentials': { title: m.problem_login_invalid_credentials_title },
  'Login.InvalidDomain': { title: m.problem_login_invalid_domain_title },
  'OAuth.Connection.AlreadyExists': { title: m.problem_o_auth_connection_already_exists_title },
  'OAuth.Connection.AlreadyLinked': { title: m.problem_o_auth_connection_already_linked_title },
  'OAuth.Flow.AnonymousOnly': { title: m.problem_o_auth_flow_anonymous_only_title },
  'OAuth.Flow.Mismatch': {
    title: m.problem_o_auth_flow_mismatch_title,
    description: m.problem_o_auth_flow_mismatch_desc,
  },
  'OAuth.Flow.MissingData': {
    title: m.problem_o_auth_flow_missing_data_title,
    description: m.problem_o_auth_flow_missing_data_desc,
  },
  'OAuth.Flow.NotFound': {
    title: m.problem_o_auth_flow_not_found_title,
    description: m.problem_o_auth_flow_not_found_desc,
  },
  'OAuth.Flow.Unsupported': { title: m.problem_o_auth_flow_unsupported_title },
  'OAuth.InternalError': {
    title: m.problem_o_auth_internal_error_title,
    description: m.problem_o_auth_internal_error_desc,
  },
  'OAuth.Link.AuthenticatedUserOnly': {
    title: m.problem_o_auth_link_authenticated_user_only_title,
  },
  'OAuth.Provider.Mismatch': {
    title: m.problem_o_auth_provider_mismatch_title,
    description: m.problem_o_auth_provider_mismatch_desc,
  },
  'OAuth.Provider.Unsupported': { title: m.problem_o_auth_provider_unsupported_title },
  'Pair.CodeNotFound': { title: m.problem_pair_code_not_found_title },
  'PasswordReset.NotFound': {
    title: m.problem_password_reset_not_found_title,
    description: m.problem_password_reset_not_found_desc,
  },
  'Session.NotFound': { title: m.problem_session_not_found_title },
  'Share.Get.NoShares': { title: m.problem_share_get_no_shares_title },
  'Share.Request.Create.CannotShareWithSelf': {
    title: m.problem_share_request_create_cannot_share_with_self_title,
  },
  'Share.Request.Create.ShockerNotFound': {
    title: m.problem_share_request_create_shocker_not_found_title,
    description: m.problem_share_request_create_shocker_not_found_desc,
  },
  'Share.Request.NotFound': { title: m.problem_share_request_not_found_title },
  'Share.User.NotFound': { title: m.problem_share_user_not_found_title },
  'ShareCode.AlreadyLinked': { title: m.problem_share_code_already_linked_title },
  'ShareCode.CantLinkOwnShareCode': { title: m.problem_share_code_cant_link_own_share_code_title },
  'ShareCode.NotFound': { title: m.problem_share_code_not_found_title },
  'ShareLink.ExpiryDateInPast': { title: m.problem_share_link_expiry_date_in_past_title },
  'ShareLink.NotFound': { title: m.problem_share_link_not_found_title },
  'ShareLink.ShockerAlreadyInShareLink': {
    title: m.problem_share_link_shocker_already_in_share_link_title,
  },
  'ShareLink.ShockerNotInShareLink': {
    title: m.problem_share_link_shocker_not_in_share_link_title,
  },
  'Shocker.Control.NoPermission': { title: m.problem_shocker_control_no_permission_title },
  'Shocker.Control.NotFound': { title: m.problem_shocker_control_not_found_title },
  'Shocker.Control.Paused': { title: m.problem_shocker_control_paused_title },
  'Shocker.NotFound': { title: m.problem_shocker_not_found_title },
  'Signup.RegistrationDisabled': { title: m.problem_signup_registration_disabled_title },
  'Signup.UsernameOrEmailExists': { title: m.problem_signup_username_or_email_exists_title },
  'Turnstile.Invalid': {
    title: m.problem_turnstile_invalid_title,
    description: m.problem_turnstile_invalid_desc,
  },
  'User.NotFound': { title: m.problem_user_not_found_title },
  'User.Privileged.DeleteDenied': { title: m.problem_user_privileged_delete_denied_title },
  'Validation.Error': { title: m.problem_validation_error_title },
  'Webhook.NotFound': { title: m.problem_webhook_not_found_title },
  'Webhook.Unsupported': {
    title: m.problem_webhook_unsupported_title,
    description: m.problem_webhook_unsupported_desc,
  },
  'Websocket.Hub.FirmwareVersionInvalid': {},
  'Websocket.Hub.LifetimeBusy': {},
  'Websocket.LiveControl.HubIdInvalid': {},
  'Websocket.LiveControl.HubLifetimeBusy': {},
  'Websocket.LiveControl.HubNotConnected': {},
  'Websocket.LiveControl.HubNotFound': {},
  'Websocket.NonWebsocketRequest': {},
};
