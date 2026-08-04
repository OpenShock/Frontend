export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauthFlowNotStarted:
    'No active sign-in attempt was found. The flow may have expired — please try again.',
  providerMismatch:
    'The sign-in attempt did not match the provider you returned from. Please try again.',
  mustBeAnonymous: 'You are already signed in. Sign out before starting a new sign-in attempt.',
  mustBeAuthenticated: 'You must be signed in to link an external account.',
  emailAlreadyRegistered:
    'An account with this email already exists. Sign in to that account to link this provider.',
  internalError: 'Something went wrong on our end. Please try again in a moment.',
  unknown: 'Unknown error occurred.',
};

export function getOAuthErrorMessage(code: string | null | undefined): string {
  return (code && OAUTH_ERROR_MESSAGES[code]) ?? OAUTH_ERROR_MESSAGES.unknown;
}
