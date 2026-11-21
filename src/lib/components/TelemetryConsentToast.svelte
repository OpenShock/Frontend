<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import Bug from '@lucide/svelte/icons/bug';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import {
    telemetryConsent,
    telemetryPrompted,
    type TelemetryLevel,
  } from '#lib/state/telemetry-consent-state.svelte.js';
  import { initTelemetry } from '#lib/telemetry/logger.js';

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
    {m.telemetry_toast_title()}
  </div>
  <p class="text-muted-foreground text-sm">
    {m.telemetry_toast_desc()}
  </p>
  <div class="flex flex-wrap justify-end gap-2">
    <Button type="button" size="sm" variant="ghost" onclick={() => choose('off')}
      >{m.telemetry_toast_no()}</Button
    >
    <Button type="button" size="sm" variant="outline" onclick={() => choose('errors')}>
      {m.telemetry_toast_errors()}
    </Button>
    <Button type="button" size="sm" onclick={() => choose('full')}
      >{m.telemetry_toast_full()}</Button
    >
  </div>
</div>
