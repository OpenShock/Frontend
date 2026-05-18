import type { ShockerPermissions } from '$lib/api';
export default function CompareShockerPermissions(a: ShockerPermissions, b: ShockerPermissions) {
  // Compare the permissions and limits of the two shocker objects
  return a.live === b.live && a.shock === b.shock && a.vibrate === b.vibrate && a.sound === b.sound;
}
