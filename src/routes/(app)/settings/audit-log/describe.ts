import type { AuditAction, AuditMetadata } from '#lib/api/index.js';
import { m } from '#lib/paraglide/messages.js';

const actionLabels: Record<AuditAction, () => string> = {
  Login: m.audit_action_login,
  Logout: m.audit_action_logout,
  PasswordChanged: m.audit_action_password_changed,
  EmailChangeRequested: m.audit_action_email_change_requested,
  EmailChanged: m.audit_action_email_changed,
  UsernameChanged: m.audit_action_username_changed,
  ApiTokenCreated: m.audit_action_api_token_created,
  ApiTokenDeleted: m.audit_action_api_token_deleted,
  OAuthConnected: m.audit_action_oauth_connected,
  OAuthDisconnected: m.audit_action_oauth_disconnected,
  AccountDeactivated: m.audit_action_account_deactivated,
  AccountReactivated: m.audit_action_account_reactivated,
  AccountDeleted: m.audit_action_account_deleted,
  AutomationTokenCreated: m.audit_action_automation_token_created,
  AutomationTokenUpdated: m.audit_action_automation_token_updated,
  AutomationTokenRotated: m.audit_action_automation_token_rotated,
  AutomationTokenDeleted: m.audit_action_automation_token_deleted,
  AutomationTokenUsed: m.audit_action_automation_token_used,
};

export function describeAction(action: AuditAction): string {
  return actionLabels[action]?.() ?? action;
}

// Actions without a typed metadata payload (e.g. Logout) fall through to null.
export function describeMetadata(metadata: AuditMetadata | null): string | null {
  if (!metadata) return null;

  switch (metadata.t) {
    case 'login':
      return m.audit_meta_session({ id: metadata.sessionId });
    case 'usernameChanged':
      return m.audit_meta_changed({ old: metadata.old, new: metadata.new });
    case 'emailChangeRequested':
      return m.audit_meta_email_requested({ email: metadata.newEmail });
    case 'emailChanged':
      return m.audit_meta_changed({ old: metadata.old, new: metadata.new });
    case 'apiTokenCreated':
      return `${metadata.name} (${metadata.permissions.join(', ')})`;
    case 'apiTokenDeleted':
      return metadata.name;
    case 'oauthConnected':
    case 'oauthDisconnected':
      return metadata.provider;
    case 'automationTokenCreated':
    case 'automationTokenUpdated':
    case 'automationTokenRotated':
      return metadata.name;
    case 'automationTokenDeleted':
      return m.audit_meta_accounts_removed({
        name: metadata.name,
        count: metadata.deletedAccountCount,
      });
    case 'automationTokenUsed':
      return `${metadata.name} (${metadata.flow})`;
    case 'accountDeactivated':
      return metadata.deleteLater ? m.audit_meta_scheduled_deletion() : m.audit_meta_kept();
    default:
      return null;
  }
}
