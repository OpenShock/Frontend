<script lang="ts">
  import { Volume2, Waves, Zap } from '@lucide/svelte';
  import { formatDurationSeconds } from '$core/utils';
  import { Label } from '$hadcn/label';
  import { Slider } from '$hadcn/slider';
  import { Switch } from '$hadcn/switch';
  import LiveControlIcon from '../svg/LiveControlIcon.svelte';
  import type { Component } from 'svelte';

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

  const features = [
    { key: 'shock', label: 'Shock', icon: Zap },
    { key: 'vibrate', label: 'Vibrate', icon: Waves },
    { key: 'sound', label: 'Sound', icon: Volume2 },
    { key: 'live', label: 'Live Control', icon: LiveControlIcon },
  ] satisfies { key: keyof Props['permissions']; label: string; icon: Component }[];
</script>

<div class="flex flex-col gap-4">
  <div class="grid grid-cols-2 gap-2">
    {#each features as { key, label, icon: Icon } (key)}
      {@const enabled = permissions[key]}
      <div
        class="border-border/60 flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 transition-colors"
        class:opacity-60={!enabled}
      >
        <span class="flex min-w-0 items-center gap-2">
          <Icon size={14} class="shrink-0" />
          <span class="truncate text-xs font-medium">{label}</span>
        </span>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => (permissions = { ...permissions, [key]: checked })}
        />
      </div>
    {/each}
  </div>

  <div class="flex flex-col gap-3">
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <Label class="text-xs">Max Intensity</Label>
        <span class="text-muted-foreground font-mono text-xs">{limits.intensity}%</span>
      </div>
      <Slider type="single" bind:value={limits.intensity} min={0} max={100} step={1} />
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <Label class="text-xs">Max Duration</Label>
        <span class="text-muted-foreground font-mono text-xs"
          >{formatDurationSeconds(limits.duration / 1000)}</span
        >
      </div>
      <Slider type="single" bind:value={limits.duration} min={0} max={30_000} step={100} />
    </div>
  </div>
</div>
