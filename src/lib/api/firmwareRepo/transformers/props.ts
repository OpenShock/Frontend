import { isString } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';

/**
 * Reads a field the repository server may omit entirely rather than send as `null`,
 * normalising both cases to `null`.
 *
 * The `Has*` guards from svelte-core require the key to be present, so they can't express
 * "absent or null" on their own.
 */
export function OptionalStringOrNull(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];

  if (value === undefined || value === null) return null;
  if (!isString(value)) throw new TransformError(`Expected string|null: ${key}`);

  return value;
}

/** Reads a required array field, leaving element validation to the caller. */
export function RequiredArray(data: Record<string, unknown>, key: string): unknown[] {
  const value = data[key];

  if (!Array.isArray(value)) throw new TransformError(`Expected array: ${key}`);

  return value;
}
