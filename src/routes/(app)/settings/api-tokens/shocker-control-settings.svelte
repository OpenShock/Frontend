<script lang="ts" module>
  import { ControlLimitMode, type ShockerControlSettings } from '$lib/api';
  import { ControlDurationProps, ControlIntensityProps } from '$lib/constants/ControlConstants';

  // ControlIntensityProps is a percentage; ControlDurationProps is in seconds, but
  // shockerControl durations are in milliseconds, so convert at this boundary.
  export const intensityRange = ControlIntensityProps;
  export const durationRange = {
    min: Math.round(ControlDurationProps.min * 1000),
    max: Math.round(ControlDurationProps.max * 1000),
    step: Math.round(ControlDurationProps.step * 1000),
  };

  /** Permissive default used when creating a new token. */
  export function defaultShockerControl(): ShockerControlSettings {
    return {
      paused: false,
      intensity: { min: intensityRange.min, max: intensityRange.max, mode: ControlLimitMode.Clamp },
      duration: { min: durationRange.min, max: durationRange.max, mode: ControlLimitMode.Clamp },
    };
  }
</script>

<script lang="ts">
  import { Label } from '@openshock/svelte-core/components/ui/label/index.js';
  import { Slider } from '@openshock/svelte-core/components/ui/slider/index.js';
  import { Switch } from '@openshock/svelte-core/components/ui/switch/index.js';
  import * as ToggleGroup from '@openshock/svelte-core/components/ui/toggle-group/index.js';
  import * as Tooltip from '@openshock/svelte-core/components/ui/tooltip/index.js';

  interface Props {
    settings: ShockerControlSettings;
  }

  let { settings = $bindable() }: Props = $props();

  const modes = Object.values(ControlLimitMode);

  const modeDescriptions: Record<ControlLimitMode, string> = {
    [ControlLimitMode.Clamp]:
      'Clamp: requests outside the allowed range are capped to the nearest limit (the min or the max).',
    [ControlLimitMode.Lerp]:
      'Lerp: the full input range is linearly rescaled so it fits within your allowed min–max range.',
  };
</script>

{#snippet modeItems()}
  {#each modes as mode (mode)}
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <ToggleGroup.Item {...props} class="cursor-pointer" value={mode}>{mode}</ToggleGroup.Item>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content class="max-w-xs">{modeDescriptions[mode]}</Tooltip.Content>
    </Tooltip.Root>
  {/each}
{/snippet}

<div class="border-surface-500 flex flex-col gap-5 rounded-md border p-4">
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-col">
      <Label class="text-sm font-medium">Paused</Label>
      <span class="text-muted-foreground text-xs">
        A paused token may not send shocker control messages.
      </span>
    </div>
    <Switch bind:checked={settings.paused} />
  </div>

  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label class="text-xs">Intensity range</Label>
      <span class="text-muted-foreground font-mono text-xs">
        {settings.intensity.min}% – {settings.intensity.max}%
      </span>
    </div>
    <Slider
      type="multiple"
      value={[settings.intensity.min, settings.intensity.max]}
      onValueChange={(v) => {
        settings.intensity.min = v[0];
        settings.intensity.max = v[1];
      }}
      min={intensityRange.min}
      max={intensityRange.max}
      step={intensityRange.step}
    />
    <ToggleGroup.Root
      type="single"
      value={settings.intensity.mode}
      onValueChange={(v) => v && (settings.intensity.mode = v as ControlLimitMode)}
      size="sm"
      variant="outline"
    >
      {@render modeItems()}
    </ToggleGroup.Root>
  </div>

  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label class="text-xs">Duration range</Label>
      <span class="text-muted-foreground font-mono text-xs">
        {(settings.duration.min / 1000).toFixed(1)}s – {(settings.duration.max / 1000).toFixed(1)}s
      </span>
    </div>
    <Slider
      type="multiple"
      value={[settings.duration.min, settings.duration.max]}
      onValueChange={(v) => {
        settings.duration.min = v[0];
        settings.duration.max = v[1];
      }}
      min={durationRange.min}
      max={durationRange.max}
      step={durationRange.step}
    />
    <ToggleGroup.Root
      type="single"
      value={settings.duration.mode}
      onValueChange={(v) => v && (settings.duration.mode = v as ControlLimitMode)}
      size="sm"
      variant="outline"
    >
      {@render modeItems()}
    </ToggleGroup.Root>
  </div>
</div>
