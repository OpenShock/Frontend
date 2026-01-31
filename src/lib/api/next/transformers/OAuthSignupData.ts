import { isObject } from '$lib/typeguards';
import { HasString, HasStringOrNull } from '../../../typeguards/propGuards';
import { TransformError } from '../TransformError';
import type { OAuthSignupData } from '../models/OAuthSignupData';

export function TransformOAuthSignupData(data: unknown): OAuthSignupData {
  if (!isObject(data)) {
    throw new TransformError('Expected object for OAuthSignupData');
  }

  if (!HasString(data, 'provider')) {
    throw new TransformError('Expected string: provider');
  }
  if (!HasStringOrNull(data, 'email')) {
    throw new TransformError('Expected string|null: email');
  }
  if (!HasStringOrNull(data, 'displayName')) {
    throw new TransformError('Expected string|null: displayName');
  }
  if (!HasString(data, 'expiresAt')) {
    throw new TransformError('Expected string: expiresAt');
  }

  const expiresAt = new Date(data.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    throw new TransformError('Invalid date: expiresAt');
  }

  return {
    provider: data.provider,
    email: data.email ?? null,
    displayName: data.displayName ?? null,
    expiresAt,
  };
}
