import type { ShockerLimits } from '#lib/api/index.js';

export default function CompareShockerLimits(a: ShockerLimits, b: ShockerLimits) {
  // Compare the limits of the two shocker objects
  return a.intensity === b.intensity && a.duration === b.duration;
}
