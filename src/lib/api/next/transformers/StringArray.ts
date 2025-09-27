import { isString } from '$lib/typeguards';

export function ValidateStringArray(data: unknown): string[] {
  if (!Array.isArray(data) || !data.every(isString)) throw new Error();
  return data;
}
