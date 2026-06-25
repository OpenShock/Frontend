<script lang="ts">
  import { parseAbsoluteToLocal, type ZonedDateTime } from '@internationalized/date';
  import DateTimePicker from '$core/components/datetime-picker/date-time-picker.svelte';
  import * as Select from '$hadcn/select';
  import { GetValResColor } from '$core/types/ValidationResult';
  import { durationBetween, formatElapsed } from '$core/utils';

  interface Props {
    option?: string;
    instant?: Temporal.Instant | null;
  }

  let { option = $bindable('never'), instant = $bindable<Temporal.Instant | null>(null) }: Props =
    $props();

  const inDays = (days: number) => () => Temporal.Now.instant().add({ hours: days * 24 });

  const expirationOptions: {
    value: string;
    label: string;
    getInstant: () => Temporal.Instant | null;
  }[] = [
    { value: 'never', label: 'Never', getInstant: () => null },
    { value: 'custom', label: 'Custom', getInstant: () => instant },
    { value: '1days', label: '1 Day', getInstant: inDays(1) },
    { value: '7days', label: '7 Days', getInstant: inDays(7) },
    { value: '30days', label: '30 Days', getInstant: inDays(30) },
    { value: '90days', label: '90 Days', getInstant: inDays(90) },
    { value: '180days', label: '180 Days', getInstant: inDays(180) },
    { value: '365days', label: '365 Days', getInstant: inDays(365) },
  ];

  let selectedExpiration = $derived(expirationOptions.find((o) => o.value === option));

  // Presets derive the instant from the chosen option; 'custom' is driven directly by the
  // date picker via the getter/setter below, so leave it untouched in that mode.
  $effect(() => {
    if (option !== 'custom') instant = selectedExpiration?.getInstant() ?? null;
  });

  // The calendar widget speaks @internationalized/date; translate to/from Temporal at this
  // single boundary so `instant` (Temporal) stays the source of truth.
  function getCustomDate(): ZonedDateTime | undefined {
    return instant ? parseAbsoluteToLocal(instant.toString()) : undefined;
  }
  function setCustomDate(date: ZonedDateTime | undefined) {
    instant = date ? Temporal.Instant.fromEpochMilliseconds(date.toDate().getTime()) : null;
  }

  let validationResult = $derived(
    option === 'custom' && !instant
      ? { valid: false, message: 'Expire date is required' }
      : { valid: true }
  );
</script>

<label>
  <span>Expiration</span>
  <Select.Root type="single" name="expiration" bind:value={option}>
    <Select.Trigger class="w-45">
      {selectedExpiration?.label}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        {#each expirationOptions as opt (opt.label)}
          <Select.Item value={opt.value} label={opt.label}>{opt.label}</Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>

  {#if option === 'custom'}
    <div class="my-2 w-1/2">
      <DateTimePicker bind:date={getCustomDate, setCustomDate} />
    </div>
  {/if}
  {#if 'message' in validationResult}
    <p class="text-xs text-{GetValResColor(validationResult)}">{validationResult.message}</p>
  {:else if option === 'never'}
    <p class="text-xs">This will never expire</p>
  {:else if instant}
    {@const elapsed = formatElapsed(durationBetween(Temporal.Now.instant(), instant))}
    {@const label = instant.toLocaleString(undefined, {
      timeZone: Temporal.Now.timeZoneId(),
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}
    <p class="text-xs" aria-label={label}>Expires {elapsed} ({label})</p>
  {/if}
</label>
