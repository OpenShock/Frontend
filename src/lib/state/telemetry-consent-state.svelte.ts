import { PersistedState } from './classes/persisted-state.svelte';

/**
 * User consent for shipping browser error diagnostics to SigNoz.
 *
 * Opt-in: defaults to `false`, so nothing is sent until the user explicitly enables it.
 * This gates {@link import('$lib/telemetry/logger').initTelemetry} in addition to the
 * deployment-level `PUBLIC_SIGNOZ_LOGS_ENABLED` env flag.
 */
class TelemetryConsentState extends PersistedState<boolean> {
  constructor() {
    super('error-logging-consent', false);
  }

  protected override deserialize(raw: string | null): boolean {
    return raw === 'true';
  }

  protected override serialize(value: boolean): string {
    return String(value);
  }
}

export const telemetryConsent = new TelemetryConsentState();
