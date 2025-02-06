import type { RoleType } from '$lib/api/internal/v1';

export interface ApiUser {
  id: string;
  name: string;
  avatar: string;
  roles: RoleType[];
}
export interface ApiUserSelf extends ApiUser {
  email: string;
}
