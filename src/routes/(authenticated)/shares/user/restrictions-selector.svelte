<script lang="ts">
  import { ChartNoAxesGantt, Volume2, Waves, Zap } from '@lucide/svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import { Slider } from '$lib/components/ui/slider';
  import MultiPauseToggle from '$lib/components/utils/MultiPauseToggle.svelte';
  import PermissionSwitch from './PermissionSwitch.svelte';

  interface Props {
    permissions: {
      shock: boolean;
      vibrate: boolean;
      sound: boolean;
      live: boolean;
    };
    limits: {
      intensity: number;
      duration: number;
    };
  }

  let { permissions = $bindable(), limits = $bindable() }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <div>
    <Label class="mb-3 text-sm">Intensity: {limits.intensity}%</Label>
    <Slider type="single" bind:value={limits.intensity} min={0} max={100} step={1} />
  </div>

  <div>
    <Label class="mb-3 text-sm">Duration: {limits.duration / 1000}s</Label>
    <Slider type="single" bind:value={limits.duration} min={0} max={30_000} step={100} />
  </div>

  <br />

  <div class="flex gap-3">
    <PermissionSwitch icon={Zap} bind:enabled={permissions.shock} />
    <PermissionSwitch icon={Waves} bind:enabled={permissions.vibrate} />
    <PermissionSwitch icon={Volume2} bind:enabled={permissions.sound} />
    <PermissionSwitch icon={ChartNoAxesGantt} bind:enabled={permissions.live} />
  </div>
</div>
