function formatInterval(unit: string, interval: number) {
  interval = Math.floor(interval);
  return interval + ' ' + unit + (interval != 1 ? 's' : '');
}

export function durationToString(durationMs: number) {
  const seconds = Math.floor(Math.abs(durationMs) / 1000);

  let interval = seconds / 31536000;
  if (interval >= 1) return formatInterval('year', interval);

  interval = seconds / 2592000;
  if (interval >= 1) return formatInterval('month', interval);

  interval = seconds / 86400;
  if (interval >= 1) return formatInterval('day', interval);

  interval = seconds / 3600;
  if (interval >= 1) return formatInterval('hour', interval);

  interval = seconds / 60;
  if (interval >= 1) return formatInterval('minute', interval);

  return formatInterval('second', seconds);
}

export function elapsedToString(elapsedMs: number) {
  const isNegative = elapsedMs < 0;
  const duration = durationToString(elapsedMs);

  return isNegative ? duration + ' ago' : 'in ' + duration;
}
