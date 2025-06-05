import { isString } from '$lib/typeguards/basicGuards';

export function isTwitterHandle(value: unknown): value is string {
  return isString(value) && value.startsWith('@');
}
