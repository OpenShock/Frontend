import { PersistedState } from '$core/state/classes/persisted-state.svelte';

/**
 * How much diagnostic data the user agrees to send to SigNoz:
 *  - `off`    — nothing is sent.
 *  - `errors` — browser error reports (message + stack) only.
 *  - `full`   — errors plus traces of API calls to the OpenShock backend.
 */
export type TelemetryLevel = 'off' | 'errors' | 'full';

const LEVELS: readonly TelemetryLevel[] = ['off', 'errors', 'full'];

/**
 * User consent for shipping browser diagnostics to SigNoz.
 *
 * Opt-in: defaults to `off`, so nothing is sent until the user explicitly chooses a level.
 * This gates {@link import('$lib/telemetry/common').telemetryLevel} in addition to the
 * deployment-level `PUBLIC_SIGNOZ_LOGS_ENABLED` env flag.
 */
class TelemetryConsentState extends PersistedState<TelemetryLevel> {
  constructor() {
    super('error-logging-consent', 'off');
  }

  protected override deserialize(raw: string | null): TelemetryLevel {
    // Migrate the previous boolean consent: `true` shipped error logs, anything else was off.
    if (raw === 'true') return 'errors';
    if (raw === null || raw === 'false') return 'off';
    return (LEVELS as readonly string[]).includes(raw) ? (raw as TelemetryLevel) : 'off';
  }

  protected override serialize(value: TelemetryLevel): string {
    return value;
  }

  /** Whether error reports (logs) should be shipped at the current level. */
  get errorsEnabled(): boolean {
    return this.value === 'errors' || this.value === 'full';
  }

  /** Whether API-call traces should be shipped at the current level. */
  get tracesEnabled(): boolean {
    return this.value === 'full';
  }
}

export const telemetryConsent = new TelemetryConsentState();

/**
 * Whether the user has already been asked about telemetry (via the first-time consent toast or by
 * changing the setting). Stays `false` until they make any explicit choice, so the prompt shows
 * exactly once. Separate from {@link telemetryConsent} so we can distinguish "chose off" from
 * "never asked".
 */
class TelemetryPromptedState extends PersistedState<boolean> {
  constructor() {
    super('telemetry-consent-prompted', false);
  }

  protected override deserialize(raw: string | null): boolean {
    return raw === 'true';
  }

  protected override serialize(value: boolean): string {
    return String(value);
  }
}

export const telemetryPrompted = new TelemetryPromptedState();
