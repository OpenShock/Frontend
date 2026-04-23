<script lang="ts">
  import { Signal, Timer } from '@lucide/svelte';
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlDurationProps,
    ControlIntensityDefault,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import { getConnection } from '$lib/signalr/user.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import { useShockerEvents } from '$lib/hooks/shocker-events.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';

  interface Props {
    shocker: ShockerResponse;
    disabled?: boolean;
  }

  let { shocker, disabled }: Props = $props();

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  const { active } = useShockerEvents(() => shocker.id);

  function ctrl(type: ControlType) {
    const conn = getConnection();
    if (!conn) return;
    serializeControlMessages(conn, [{ id: shocker.id, type, intensity, duration }]);
  }
</script>

<!-- Sliders -->
<div class="grid grid-cols-[24px_128px_40px] items-center gap-1 text-center">
  <Signal />
  <input type="range" bind:value={intensity} {...ControlIntensityProps} />
  <p>{intensity}%</p>
  <Timer />
  <input type="range" bind:value={duration} {...ControlDurationProps} />
  <p>{duration}s</p>
</div>
<!-- Buttons -->
<ActionButtons {ctrl} {duration} {active} {disabled} />
