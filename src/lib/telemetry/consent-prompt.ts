import { PUBLIC_SIGNOZ_LOGS_ENABLED } from '$env/static/public';
import TelemetryConsentToast from '$lib/components/TelemetryConsentToast.svelte';
import { telemetryPrompted } from '$lib/state/telemetry-consent-state.svelte';
import { toast } from 'svelte-sonner';

/**
 * Show the first-time telemetry consent prompt as a persistent bottom-right toast — but only if the
 * deployment actually ships telemetry and the user hasn't been asked before. Safe to call on every
 * app load; it no-ops once a choice has been made.
 */
export function maybePromptTelemetryConsent(): void {
  if (typeof window === 'undefined') return;
  // Only ask where telemetry can actually ship.
  if (PUBLIC_SIGNOZ_LOGS_ENABLED !== 'true') return;
  if (telemetryPrompted.value) return;

  const id = toast(TelemetryConsentToast, {
    duration: Number.POSITIVE_INFINITY,
    position: 'bottom-right',
    // Dismissing without choosing should not count as "asked" — leave the flag unset so we can ask
    // again next time, while still applying nothing now.
    componentProps: { dismiss: () => toast.dismiss(id) },
  });
}
