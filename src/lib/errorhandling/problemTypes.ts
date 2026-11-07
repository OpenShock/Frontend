// Registry of every problem `type` the API can return, with the copy the UI shows for it.
// Keep this file free of imports: scripts/check-problem-types.js imports it directly under Node.
// The keys are checked against the API source by that script and by problemTypes.test.ts.

export interface ProblemCopy {
  /** User-facing headline. Omit to fall back to the backend title. */
  title?: string;
  /** Optional second line. Omit to fall back to the backend detail. */
  description?: string;
}

export const ProblemTypes = {
  // Account
  'Account.AccountNotActivated': {
    title: 'Account not activated',
    description: 'Check your inbox for the activation email.',
  },
  'Account.Activation.NotFound': {
    title: 'Activation link is invalid',
    description: 'The link may have expired or already been used.',
  },
  'Account.Activation.ResendTooMany': {
    title: 'Too many activation emails requested',
    description: 'Please wait a while before trying again.',
  },
  'Account.Activation.ResendUnavailable': {
    title: 'Cannot resend activation email',
    description: 'Log in again to request a new activation link.',
  },
  'Account.Deactivate.AlreadyDeactivated': { title: 'Account is already deactivated' },
  'Account.Deactivate.DeniedPrivileged': { title: 'Privileged accounts cannot be deactivated' },
  'Account.Deactivate.Unauthorized': { title: 'You are not allowed to do this' },
  'Account.Deactivated': { title: 'This account has been deactivated' },
  'Account.Email.AlreadyInUse': { title: 'That email address is already in use' },
  'Account.Email.Invalid': { title: 'That email address is not valid' },
  'Account.Email.Taken': { title: 'That email address is already in use' },
  'Account.Email.TooManyRequests': {
    title: 'Too many email change requests',
    description: 'Please wait a while before trying again.',
  },
  'Account.Email.Unchanged': { title: 'That is already your email address' },
  'Account.Email.VerifyNotFound': {
    title: 'Verification link is invalid',
    description: 'The link may have expired or already been used.',
  },
  'Account.OAuthOnly': {
    title: 'This account has no password',
    description: 'Sign in with the provider you signed up with.',
  },
  'Account.Password.NotSet': {
    title: 'No password set',
    description: 'This account signs in through an external provider.',
  },
  'Account.Password.OldPasswordInvalid': { title: 'Current password is incorrect' },
  'Account.Username.Invalid': { title: 'That username is not allowed' },
  'Account.Username.RecentlyChanged': {
    title: 'Username changed too recently',
    description: 'You can change your username once every 7 days.',
  },
  'Account.Username.Taken': { title: 'That username is already taken' },

  // Admin
  'Admin.User.Deactivated': { title: 'This user is deactivated' },
  'Admin.User.NotActivated': { title: 'This user has not been activated yet' },

  // API tokens
  'ApiToken.CanOnlyDeleteSelf': { title: 'An API token can only delete itself' },
  'ApiToken.NotFound': { title: 'API token not found' },
  'ApiToken.Paused': { title: 'This API token is paused' },

  // Hub to gateway assignment (hub token only)
  'AssignLcg.BadSchemaVersion': {},
  'AssignLcg.NoLcgAvailable': {},

  // Authentication layer, any authenticated endpoint
  'Authentication.AccountDeactivated': { title: 'This account has been deactivated' },
  'Authentication.AccountNotActivated': { title: 'This account has not been activated' },
  'Authentication.CookieMissingOrInvalid': {
    title: 'You are not logged in',
    description: 'Your session may have expired. Please log in again.',
  },
  'Authentication.HeaderMissingOrInvalid': { title: 'Invalid API token' },
  'Authentication.SessionInvalid': {
    title: 'Session expired',
    description: 'Please log in again.',
  },
  'Authentication.TokenInvalid': { title: 'Invalid API token' },
  'Authentication.UnknownError': { title: 'Authentication failed' },

  // Authorization layer, any authenticated endpoint
  'Authorization.Policy.NotMet': { title: 'You do not have permission to do this' },
  'Authorization.Token.Only': { title: 'This action requires an API token' },
  'Authorization.Token.PermissionMissing': {
    title: 'This API token is missing a required permission',
  },
  'Authorization.UnknownError': { title: 'Authorization failed' },
  'Authorization.UserSession.Only': { title: 'This action requires a logged-in session' },

  'AutomationToken.NotAllowedForAccount': {
    title: 'Automation tokens cannot be used with privileged accounts',
  },

  // Admin configuration
  'Configuration.AlreadyExists': { title: 'A configuration entry with that name already exists' },
  'Configuration.InvalidNameFormat': {
    title: 'Invalid configuration name',
    description: 'Only A to Z and underscores are allowed.',
  },
  'Configuration.InvalidValueFormat': { title: 'Value does not match the configuration type' },
  'Configuration.NotFound': { title: 'Configuration entry not found' },

  // Control stats
  'ControlStats.InvalidRange': { title: 'The from date must not be after the to date' },
  'ControlStats.InvalidTimeZone': { title: 'Unknown time zone' },
  'ControlStats.MissingCapability': {},

  // Hubs
  'Device.NotFound': { title: 'Hub not found' },
  'Device.NotOnline': { title: 'Hub is offline' },
  'Device.TooManyHubs': { title: 'You have reached the maximum number of hubs' },
  'Device.TooManyShockers': { title: 'This hub has reached its maximum number of shockers' },

  'Endpoint.Retired': { title: 'This feature is no longer available' },
  ExpressionError: { title: 'Invalid filter expression' },
  // Built inline by the Turnstile and token-report handlers rather than in an error class.
  InternalServerError: { title: 'Something went wrong on our end' },

  // Login
  'Login.InvalidCredentials': { title: 'Invalid username or password' },
  'Login.InvalidDomain': { title: 'Logging in from this address is not allowed' },

  // OAuth
  'OAuth.Connection.AlreadyExists': {
    title: 'Your account is already connected to this provider',
  },
  'OAuth.Connection.AlreadyLinked': {
    title: 'This external account is already linked to another user',
  },
  'OAuth.Flow.AnonymousOnly': { title: 'You are already signed in' },
  'OAuth.Flow.Mismatch': {
    title: 'Sign-in attempt does not match',
    description: 'Please start over.',
  },
  'OAuth.Flow.MissingData': {
    title: 'The provider did not return your account details',
    description: 'Please try again.',
  },
  'OAuth.Flow.NotFound': {
    title: 'Sign-in attempt expired',
    description: 'Please start over.',
  },
  'OAuth.Flow.Unsupported': { title: 'Unsupported sign-in flow' },
  'OAuth.InternalError': {
    title: 'Something went wrong during sign-in',
    description: 'Please try again in a moment.',
  },
  'OAuth.Link.AuthenticatedUserOnly': {
    title: 'You must be signed in to link an external account',
  },
  'OAuth.Provider.Mismatch': {
    title: 'Sign-in attempt does not match the provider',
    description: 'Please start over.',
  },
  'OAuth.Provider.Unsupported': { title: 'This sign-in provider is not supported' },

  'Pair.CodeNotFound': { title: 'Pair code not found' },
  'PasswordReset.NotFound': {
    title: 'Password reset link is invalid',
    description: 'The link may have expired or already been used.',
  },
  'Session.NotFound': { title: 'Session not found' },

  // User shares
  'Share.Get.NoShares': { title: 'You have no shares with this user' },
  'Share.Request.Create.CannotShareWithSelf': { title: 'You cannot share with yourself' },
  'Share.Request.Create.ShockerNotFound': {
    title: 'One or more shockers were not found',
    description: 'They may have been removed or do not belong to you.',
  },
  'Share.Request.NotFound': { title: 'Share invite not found' },
  'Share.User.NotFound': { title: 'Share not found' },

  // Legacy share codes
  'ShareCode.AlreadyLinked': { title: 'Shocker is already linked to your account' },
  'ShareCode.CantLinkOwnShareCode': { title: 'You cannot redeem your own share code' },
  'ShareCode.NotFound': { title: 'Share code not found' },

  // Public shares
  'ShareLink.ExpiryDateInPast': { title: 'Expiry date cannot be in the past' },
  'ShareLink.NotFound': { title: 'Public share not found' },
  'ShareLink.ShockerAlreadyInShareLink': { title: 'Shocker is already in this public share' },
  'ShareLink.ShockerNotInShareLink': { title: 'Shocker is not in this public share' },

  // Shockers
  'Shocker.Control.NoPermission': { title: 'You do not have permission to control this shocker' },
  'Shocker.Control.NotFound': { title: 'Shocker not found' },
  'Shocker.Control.Paused': { title: 'Shocker is paused' },
  'Shocker.NotFound': { title: 'Shocker not found' },

  // Signup
  'Signup.RegistrationDisabled': { title: 'Registration is currently disabled' },
  'Signup.UsernameOrEmailExists': { title: 'That username or email is already in use' },

  'Turnstile.Invalid': {
    title: 'Verification failed',
    description: 'Please complete the challenge again and retry.',
  },

  'User.NotFound': { title: 'User not found' },
  'User.Privileged.DeleteDenied': { title: 'Privileged users cannot be deleted' },

  'Validation.Error': { title: 'Some fields are invalid' },

  // Admin webhooks
  'Webhook.NotFound': { title: 'Webhook not found' },
  'Webhook.Unsupported': {
    title: 'Only Discord webhooks are supported',
    description: 'Use a discord.com URL, not canary or ptb.',
  },

  // Websocket endpoints (hub and live control, never reached through the REST client)
  'Websocket.Hub.FirmwareVersionInvalid': {},
  'Websocket.Hub.LifetimeBusy': {},
  'Websocket.LiveControl.HubIdInvalid': {},
  'Websocket.LiveControl.HubLifetimeBusy': {},
  'Websocket.LiveControl.HubNotConnected': {},
  'Websocket.LiveControl.HubNotFound': {},
  'Websocket.NonWebsocketRequest': {},
} as const satisfies Record<string, ProblemCopy>;

export type ProblemType = keyof typeof ProblemTypes;

export function isKnownProblemType(type: string): type is ProblemType {
  return Object.hasOwn(ProblemTypes, type);
}
