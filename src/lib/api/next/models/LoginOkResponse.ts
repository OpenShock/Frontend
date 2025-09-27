import type { RoleType } from './RoleType';

export interface LoginOkResponse {
  accountId: string;
  accountName: string;
  accountEmail: string;
  isVerified: boolean;
  profileImage: string;
  accountRoles: RoleType[];
}
