import type { UserShareInfo } from "$lib/api/internal/v2";
import CompareShockerPermissions from "$lib/comparers/ShockerPermissionsComparer";
import CompareShockerLimits from "./ShockerLimitsComparer";


export function ComparePermissionsAndLimits(a: UserShareInfo, b: UserShareInfo) {
  return (
    CompareShockerPermissions(a.permissions, b.permissions) &&
    CompareShockerLimits(a.limits, b.limits)
  );
}
