import { RoleType } from '../models';

export function IsRoleType(value: unknown): value is RoleType {
  return typeof value === 'string' && Object.values(RoleType).includes(value as RoleType);
}
