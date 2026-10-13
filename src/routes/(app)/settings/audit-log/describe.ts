import type { AuditAction, AuditMetadata } from '#lib/api/index.js';

const actionLabels: Record<AuditAction, string> = {
  Login: 'Signed in',
  Logout: 'Signed out',
  PasswordChanged: 'Password changed',
  EmailChangeRequested: 'Email change requested',
  EmailChanged: 'Email changed',
  UsernameChanged: 'Username changed',
  ApiTokenCreated: 'API token created',
  ApiTokenDeleted: 'API token deleted',
  OAuthConnected: 'Connection added',
  OAuthDisconnected: 'Connection removed',
  AccountDeactivated: 'Account deactivated',
  AccountReactivated: 'Account reactivated',
  AccountDeleted: 'Account deleted',
  AutomationTokenCreated: 'Automation token created',
  AutomationTokenUpdated: 'Automation token updated',
  AutomationTokenRotated: 'Automation token rotated',
  AutomationTokenDeleted: 'Automation token deleted',
  AutomationTokenUsed: 'Automation token used',
};

export function describeAction(action: AuditAction): string {
  return actionLabels[action] ?? action;
}

// Actions without a typed metadata payload (e.g. Logout) fall through to null.
export function describeMetadata(metadata: AuditMetadata | null): string | null {
  if (!metadata) return null;

  switch (metadata.t) {
    case 'login':
      return `Session ${metadata.sessionId}`;
    case 'usernameChanged':
      return `${metadata.old} to ${metadata.new}`;
    case 'emailChangeRequested':
      return `Requested change to ${metadata.newEmail}`;
    case 'emailChanged':
      return `${metadata.old} to ${metadata.new}`;
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
      return `${metadata.name} (${metadata.deletedAccountCount} accounts removed)`;
    case 'automationTokenUsed':
      return `${metadata.name} (${metadata.flow})`;
    case 'accountDeactivated':
      return metadata.deleteLater ? 'Scheduled for deletion' : 'Kept for reactivation';
    default:
      return null;
  }
}
