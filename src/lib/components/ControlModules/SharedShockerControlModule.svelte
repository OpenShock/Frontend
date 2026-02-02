<script lang="ts">
  import { ChartNoAxesGantt, ClockFading, Gauge, Pause } from '@lucide/svelte';
  import type { SharedShocker } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlDurationProps,
    ControlIntensityDefault,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import ControlListener from './ControlListener.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';
  import CircleSlider from './impl/CircleSlider.svelte';

  interface Props {
    shocker: SharedShocker;
    disabled?: boolean;
  }

  let { shocker, disabled }: Props = $props();

  // Limits from API (duration in ms, convert to seconds for display)
  const maxIntensity = $derived(shocker.limits.intensity ?? 100);
  const maxDurationSeconds = $derived(
    shocker.limits.duration ? shocker.limits.duration / 1000 : ControlDurationProps.max
  );

  // Pause state
  const isPaused = $derived(shocker.isPaused);

  // Permissions
  const permissions = $derived(shocker.permissions);

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  let active = $state<ControlType | null>(null);

  // Clamp values to limits
  const clampedIntensity = $derived(Math.min(intensity, maxIntensity));
  const clampedDuration = $derived(Math.min(duration, maxDurationSeconds));

  function ctrl(type: ControlType) {
    if (!$SignalR_Connection) return;
    serializeControlMessages($SignalR_Connection, [
      {
        id: shocker.id,
        type,
        intensity: clampedIntensity,
        duration: clampedDuration * 1000,
      },
    ]);
  }

  // Permission check for each control type
  const disabledControls = $derived({
    [ControlType.Sound]: !permissions.sound,
    [ControlType.Vibrate]: !permissions.vibrate,
    [ControlType.Shock]: !permissions.shock,
  });
</script>

<ControlListener shockerId={shocker.id} bind:active />

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
  class:opacity-50={isPaused}
>
  <!-- Title -->
  <h2 class="w-full truncate px-4 text-center text-lg font-bold">{shocker.name}</h2>

  <div class="grow flex flex-col items-center justify-center">
    <!-- Pause indicator -->
    {#if isPaused}
      <div class="flex items-center gap-1 text-sm text-destructive">
        <Pause size={14} />
        <span>Paused</span>
      </div>
    {/if}

    <!-- Limits -->
    <div class="flex gap-3 text-xs text-muted-foreground">
      <span class="flex items-center gap-1" title="Max Intensity">
        <Gauge size={14} />
        {maxIntensity}%
      </span>
      <span class="flex items-center gap-1" title="Max Duration">
        <ClockFading size={14} />
        {maxDurationSeconds}s
      </span>
    </div>
  </div>

  <!-- Sliders -->
  <div class="flex items-center gap-2">
    <CircleSlider
      name="Intensity"
      bind:value={intensity}
      {...ControlIntensityProps}
      max={maxIntensity}
    />
    <CircleSlider
      name="Duration"
      bind:value={duration}
      {...ControlDurationProps}
      max={maxDurationSeconds}
    />
  </div>
  <!-- Buttons -->
  <ActionButtons
    {ctrl}
    duration={clampedDuration}
    {active}
    disabled={disabled || isPaused}
    {disabledControls}
  />
</div>
