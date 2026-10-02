import type { UserShareInfo } from '#lib/api/index.js';
import CompareShockerPermissions from '#lib/comparers/ShockerPermissionsComparer.js';
import CompareShockerLimits from './ShockerLimitsComparer';

export function ComparePermissionsAndLimits(a: UserShareInfo, b: UserShareInfo) {
  return (
    CompareShockerPermissions(a.permissions, b.permissions) &&
    CompareShockerLimits(a.limits, b.limits)
  );
}
