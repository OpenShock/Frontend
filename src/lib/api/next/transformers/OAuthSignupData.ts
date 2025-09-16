import { isObject, isString, isStringOrNull } from '$lib/typeguards';
import { TransformError } from '../TransformError';
import type { OAuthSignupData } from '../models/OAuthSignupData';

export function TransformOAuthSignupData(data: unknown): OAuthSignupData {
  if (!isObject(data)) {
    throw new TransformError('Expected object for OAuthSignupData');
  }

  if (!Object.hasOwn(data, 'provider') || !isString(data.provider)) {
    throw new TransformError('Expected string: provider');
  }
  if (!Object.hasOwn(data, 'email') || !isStringOrNull(data.email)) {
    throw new TransformError('Expected string|null: email');
  }
  if (!Object.hasOwn(data, 'displayName') || !isStringOrNull(data.displayName)) {
    throw new TransformError('Expected string|null: displayName');
  }
  if (!Object.hasOwn(data, 'expiresAt') || !isString(data.expiresAt)) {
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
