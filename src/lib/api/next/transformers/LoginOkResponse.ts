import { isBoolean, isObject, isString } from '$lib/typeguards';
import { TransformError } from '../TransformError';
import type { LoginOkResponse } from '../models';
import { IsRoleType } from './RoleType';

export function TransformLoginOkResponse(data: unknown): LoginOkResponse {
  if (!isObject(data)) {
    throw new TransformError('Expected object for LoginOkResponse');
  }

  if (!Object.hasOwn(data, 'accountId') || !isString(data.accountId))
    throw new TransformError('Expected string: accountId');
  if (!Object.hasOwn(data, 'accountName') || !isString(data.accountName))
    throw new TransformError('Expected string: accountName');
  if (!Object.hasOwn(data, 'accountEmail') || !isString(data.accountEmail))
    throw new TransformError('Expected string: accountEmail');
  if (!Object.hasOwn(data, 'isVerified') || !isBoolean(data.isVerified))
    throw new TransformError('Expected boolean: isVerified');
  if (!Object.hasOwn(data, 'profileImage') || !isString(data.profileImage))
    throw new TransformError('Expected string: profileImage');
  if (
    !Object.hasOwn(data, 'accountRoles') ||
    !Array.isArray(data.accountRoles) ||
    !data.accountRoles.every(IsRoleType)
  ) {
    throw new TransformError('Expected RoleType[]: accountRoles');
  }

  return data as LoginOkResponse;
}
