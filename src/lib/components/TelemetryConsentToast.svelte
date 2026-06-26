<script lang="ts">
  import Bug from '@lucide/svelte/icons/bug';
  import { Button } from '@openshock/svelte-core/ui/button';
  import {
    telemetryConsent,
    telemetryPrompted,
    type TelemetryLevel,
  } from '$lib/state/telemetry-consent-state.svelte';
  import { initTelemetry } from '$lib/telemetry/logger';

  interface Props {
    /** Dismisses this toast. Provided by the caller with the toast id. */
    dismiss: () => void;
  }

  let { dismiss }: Props = $props();

  function choose(level: TelemetryLevel) {
    telemetryConsent.value = level;
    telemetryPrompted.value = true;
    // Apply immediately on opt-in; the prompt only ever appears once.
    initTelemetry();
    dismiss();
  }
</script>

<div class="flex flex-col gap-3">
  <div class="flex items-center gap-2 font-medium">
    <Bug class="size-4" />
    Help improve OpenShock?
  </div>
  <p class="text-muted-foreground text-sm">
    Send diagnostics to help us fix crashes and slow API calls. Reports include the error message,
    stack trace and your IP. You can change this any time in Account settings.
  </p>
  <div class="flex flex-wrap justify-end gap-2">
    <Button type="button" size="sm" variant="ghost" onclick={() => choose('off')}>No thanks</Button>
    <Button type="button" size="sm" variant="outline" onclick={() => choose('errors')}>
      Errors only
    </Button>
    <Button type="button" size="sm" onclick={() => choose('full')}>Full</Button>
  </div>
</div>
