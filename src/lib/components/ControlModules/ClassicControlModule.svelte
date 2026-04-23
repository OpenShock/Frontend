<script lang="ts">
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

  interface Props {
    id: string;
    isPaused: boolean;
    limits?: { intensity?: number | null; duration?: number | null };
    permissions?: { vibrate?: boolean; sound?: boolean; shock?: boolean };
    ctrl: (id: string, type: ControlType, intensity: number, durationSeconds: number) => void;
    disabled?: boolean;
  }

  let { id, isPaused, limits, permissions, ctrl, disabled }: Props = $props();

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  const { active } = useShockerEvents(() => id);

  const maxIntensity = $derived(limits?.intensity ?? ControlIntensityProps.max);
  const maxDuration = $derived(
    limits?.duration != null ? limits.duration / 1000 : ControlDurationProps.max
  );
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

{#if hasLimits}
  <LimitsDisplay {maxIntensity} maxDurationSeconds={maxDuration} />
{/if}

<!-- Sliders -->
<div class="grid w-full grid-cols-2 place-items-center gap-2">
  <CircleSlider
    name="Intensity"
    bind:value={intensity}
    {...ControlIntensityProps}
    max={maxIntensity}
  />
  <CircleSlider name="Duration" bind:value={duration} {...ControlDurationProps} max={maxDuration} />
</div>

<!-- Buttons -->
<ActionButtons
  ctrl={handleCtrl}
  duration={clampedDuration}
  {active}
  disabled={disabled || isPaused}
  {disabledControls}
/>
