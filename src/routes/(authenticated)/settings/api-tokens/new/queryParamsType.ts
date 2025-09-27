import type { PermissionType } from '$lib/api/internal/v1';

export type QueryParamsType = {
  name: string;
  redirectUri: string;
  permissions: PermissionType[];
};
