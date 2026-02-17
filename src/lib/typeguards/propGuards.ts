import { isBoolean, isNumber, isObject, isString } from '$lib/typeguards';

export function HasString<K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is object & Record<K, string> {
  return Object.hasOwn(obj, key) && isString(obj[key]);
}

export function HasStringOrNull<K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is object & Record<K, string | null> {
  return Object.hasOwn(obj, key) && (isString(obj[key]) || obj[key] === null);
}

export function HasNumber<K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is object & Record<K, number> {
  return Object.hasOwn(obj, key) && isNumber(obj[key]);
}

export function HasBoolean<K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is object & Record<K, boolean> {
  return Object.hasOwn(obj, key) && isBoolean(obj[key]);
}

export function HasObject<K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is object & Record<K, Record<string, unknown>> {
  return Object.hasOwn(obj, key) && isObject(obj[key]);
}

export function HasStringArray<K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is object & Record<K, string[]> {
  return (
    Object.hasOwn(obj, key) &&
    Array.isArray(obj[key]) &&
    obj[key].every((item: unknown) => isString(item))
  );
}
