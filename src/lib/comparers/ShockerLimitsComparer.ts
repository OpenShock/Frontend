import type { ShockerLimits } from "$lib/api/internal/v2";

export default function CompareShockerLimits(a: ShockerLimits, b: ShockerLimits) {
  // Compare the limits of the two shocker objects
  return (
    a.intensity === b.intensity &&
    a.duration === b.duration
  );
}
