import { RoleType } from '../models';

export function IsRoleType(value: string): value is RoleType {
  return Object.values(RoleType).includes(value as RoleType);
}
