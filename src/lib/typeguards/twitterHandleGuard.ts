import { isString } from './basicGuards';

export function isTwitterHandle(value: unknown): value is string {
  return isString(value) && value.startsWith('@');
}
