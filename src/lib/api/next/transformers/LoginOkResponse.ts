import { isObject } from '$lib/typeguards';
import { HasBoolean, HasString, HasStringArray } from '../../../typeguards/propGuards';
import { TransformError } from '../TransformError';
import type { LoginOkResponse } from '../models';
import { IsRoleType } from './RoleType';

export function TransformLoginOkResponse(data: unknown): LoginOkResponse {
  if (!isObject(data)) {
    throw new TransformError('Expected object for LoginOkResponse');
  }

  if (!HasString(data, 'accountId')) throw new TransformError('Expected string: accountId');
  if (!HasString(data, 'accountName')) throw new TransformError('Expected string: accountName');
  if (!HasString(data, 'accountEmail')) throw new TransformError('Expected string: accountEmail');
  if (!HasBoolean(data, 'isVerified')) throw new TransformError('Expected boolean: isVerified');
  if (!HasString(data, 'profileImage')) throw new TransformError('Expected string: profileImage');
  if (!HasStringArray(data, 'accountRoles') || !data.accountRoles.every(IsRoleType)) {
    throw new TransformError('Expected RoleType[]: accountRoles');
  }

  return {
    accountId: data.accountId,
    accountName: data.accountName,
    accountEmail: data.accountEmail,
    isVerified: data.isVerified,
    profileImage: data.profileImage,
    accountRoles: data.accountRoles,
  };
}
