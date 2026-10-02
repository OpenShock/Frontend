<script lang="ts">
  import { Signal, Timer } from '@lucide/svelte';
  import type { ShockerResponse } from '#lib/api/index.js';
  import {
    ControlDurationDefault,
    ControlDurationProps,
    ControlIntensityDefault,
    ControlIntensityProps,
  } from '#lib/constants/ControlConstants.js';
  import { getConnection } from '#lib/signalr/user.svelte.js';
  import { ControlType } from '#lib/signalr/models/ControlType.js';
  import { serializeControlMessages } from '#lib/signalr/serializers/Control.js';
  import { formatDurationSeconds } from '@openshock/svelte-core/utils';
  import { useShockerEvents } from '#lib/hooks/shocker-events.svelte.js';
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
  <p>{formatDurationSeconds(duration)}</p>
</div>
<!-- Buttons -->
<ActionButtons {ctrl} {duration} {active} {disabled} />
