export interface OAuthSignupData {
  provider: string;
  email: string | null;
  displayName: string | null;
  expiresAt: Date;
}
