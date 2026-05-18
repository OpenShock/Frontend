import type { PermissionType } from '$lib/api';
export type QueryParamsType = {
  name: string;
  redirectUri: string;
  permissions: PermissionType[];
};
