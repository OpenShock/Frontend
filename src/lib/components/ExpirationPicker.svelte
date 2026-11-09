<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { intlLocale } from '#lib/i18n/intl.js';
  import { formatRelativeInstant } from '#lib/utils/datetime.js';
  import { parseAbsoluteToLocal, type ZonedDateTime } from '@internationalized/date';
  import { DateTimePicker } from '@openshock/svelte-core/components/datetime-picker';
  import * as Select from '@openshock/svelte-core/components/ui/select';
  import { GetValResColor } from '@openshock/svelte-core/types';

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
    { value: 'never', label: m.expiration_never(), getInstant: () => null },
    { value: 'custom', label: m.expiration_custom(), getInstant: () => instant },
    { value: '1days', label: m.expiration_days({ count: 1 }), getInstant: inDays(1) },
    { value: '7days', label: m.expiration_days({ count: 7 }), getInstant: inDays(7) },
    { value: '30days', label: m.expiration_days({ count: 30 }), getInstant: inDays(30) },
    { value: '90days', label: m.expiration_days({ count: 90 }), getInstant: inDays(90) },
    { value: '180days', label: m.expiration_days({ count: 180 }), getInstant: inDays(180) },
    { value: '365days', label: m.expiration_days({ count: 365 }), getInstant: inDays(365) },
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
      ? { valid: false, message: m.expiration_required() }
      : { valid: true }
  );
</script>

<label>
  <span>{m.expiration_label()}</span>
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
    <p class="text-xs">{m.expiration_never_desc()}</p>
  {:else if instant}
    {@const elapsed = formatRelativeInstant(instant)}
    {@const label = instant.toLocaleString(intlLocale(), {
      timeZone: Temporal.Now.timeZoneId(),
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}
    <p class="text-xs" aria-label={label}>
      {m.expiration_expires_at({ time: elapsed, date: label })}
    </p>
  {/if}
</label>
