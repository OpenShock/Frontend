export function durationBetween(from: Temporal.Instant, to: Temporal.Instant): Temporal.Duration {
  const tz = Temporal.Now.timeZoneId();
  return from.toZonedDateTimeISO(tz).until(to.toZonedDateTimeISO(tz), { largestUnit: 'year' });
}

export function formatDuration(duration: Temporal.Duration): string {
  const abs = duration.abs();
  const { years, months, days, hours, minutes, seconds } = abs;

  if (years >= 1) return formatInterval('year', years);
  if (months >= 1) return formatInterval('month', months);
  if (days >= 1) return formatInterval('day', days);
  if (hours >= 1) return formatInterval('hour', hours);
  if (minutes >= 1) return formatInterval('minute', minutes);
  return formatInterval('second', seconds);
}

export function formatElapsed(duration: Temporal.Duration): string {
  const text = formatDuration(duration);
  return duration.sign < 0 ? text + ' ago' : 'in ' + text;
}

function formatInterval(unit: string, interval: number): string {
  return `${interval} ${unit}${interval !== 1 ? 's' : ''}`;
}
