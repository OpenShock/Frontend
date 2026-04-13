<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlDurationProps,
    ControlIntensityDefault,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { useShockerEvents } from '$lib/hooks/shocker-events.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';
  import CircleSlider from './impl/CircleSlider.svelte';
  import LimitsDisplay from './impl/LimitsDisplay.svelte';
  import PauseOverlay from './impl/PauseOverlay.svelte';
  import ShockerMenu from './impl/ShockerMenu.svelte';

  interface Props {
    id: string;
    name: string;
    isPaused: boolean;
    pauseReason?: string | null;
    limits?: { intensity?: number | null; duration?: number | null };
    permissions?: { vibrate?: boolean; sound?: boolean; shock?: boolean };
    ctrl: (id: string, type: ControlType, intensity: number, durationSeconds: number) => void;
    resume?: (id: string) => Promise<void>;
    rawShocker?: ShockerResponse;
    disabled?: boolean;
  }

  let {
    id,
    name,
    isPaused,
    pauseReason,
    limits,
    permissions,
    ctrl,
    resume,
    rawShocker,
    disabled,
  }: Props = $props();

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  const { active } = useShockerEvents(() => id);

  const maxIntensity = $derived(limits?.intensity ?? ControlIntensityProps.max);
  const maxDuration = $derived(limits?.duration != null ? limits.duration / 1000 : ControlDurationProps.max);
  const hasLimits = $derived(limits?.intensity != null || limits?.duration != null);

  const clampedIntensity = $derived(Math.min(intensity, maxIntensity));
  const clampedDuration = $derived(Math.min(duration, maxDuration));

  const disabledControls = $derived<Partial<Record<ControlType, boolean>>>(
    permissions
      ? {
          [ControlType.Sound]: !permissions.sound,
          [ControlType.Vibrate]: !permissions.vibrate,
          [ControlType.Shock]: !permissions.shock,
        }
      : {}
  );

  function handleCtrl(type: ControlType) {
    ctrl(id, type, clampedIntensity, clampedDuration);
  }
</script>

<div
  class="border-surface-400-500-token relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
>
  <PauseOverlay {isPaused} {pauseReason} resume={resume ? () => resume(id) : undefined} />

  <!-- Title -->
  <h2 class="flex w-full justify-between px-4 text-center text-lg font-bold">
    <span>{name}</span>
    {#if rawShocker}
      <ShockerMenu shocker={rawShocker} />
    {/if}
  </h2>

  {#if hasLimits}
    <LimitsDisplay {maxIntensity} maxDurationSeconds={maxDuration} />
  {/if}

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
      max={maxDuration}
    />
  </div>

  <!-- Buttons -->
  <ActionButtons
    ctrl={handleCtrl}
    duration={clampedDuration}
    {active}
    disabled={disabled || isPaused}
    {disabledControls}
  />
</div>
