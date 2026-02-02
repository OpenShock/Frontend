<script lang="ts">
  import { Time } from '@internationalized/date';
  import { Label } from '$lib/components/ui/label';
  import { cn } from '$lib/utils';
  import TimePickerInput from './time-picker-input.svelte';

  let {
    time = $bindable(new Time(0, 0)),

    view = 'labels',

    setTime,

    showSeconds = false,
  }: {
    time: Time | undefined;

    view?: 'labels' | 'dotted';

    setTime?: (time: Time) => void;

    showSeconds?: boolean;
  } = $props();

  let minuteRef = $state<HTMLInputElement | null>(null);
  let hourRef = $state<HTMLInputElement | null>(null);
  let secondRef = $state<HTMLInputElement | null>(null);
</script>

<div class={cn('flex items-center gap-2', view === 'dotted' && 'gap-1')}>
  <div class="grid gap-1 text-center">
    {#if view === 'labels'}
      <Label for="hours" class="text-xs">Hours</Label>
    {/if}

    <TimePickerInput
      picker="hours"
      bind:time
      bind:ref={hourRef}
      {setTime}
      onRightFocus={() => minuteRef?.focus()}
    />
  </div>

  {#if view === 'dotted'}
    <span class="-translate-y-0.5">:</span>
  {/if}

  <div class="grid gap-1 text-center">
    {#if view === 'labels'}
      <Label for="minutes" class="text-xs">Minutes</Label>
    {/if}

    <TimePickerInput
      picker="minutes"
      bind:time
      bind:ref={minuteRef}
      {setTime}
      onLeftFocus={() => hourRef?.focus()}
      onRightFocus={() => secondRef?.focus()}
    />
  </div>

  {#if view === 'dotted'}
    <span class="-translate-y-0.5">:</span>
  {/if}

  {#if showSeconds}
    <div class="grid gap-1 text-center">
      {#if view === 'labels'}
        <Label for="seconds" class="text-xs">Seconds</Label>
      {/if}

      <TimePickerInput
        picker="seconds"
        bind:time
        bind:ref={secondRef}
        {setTime}
        onLeftFocus={() => minuteRef?.focus()}
      />
    </div>
  {/if}
</div>
