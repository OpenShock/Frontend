<script lang="ts">
  import type { ZonedDateTime } from '@internationalized/date';
  import DateTimePicker from '$lib/components/datetime-picker/date-time-picker.svelte';
  import * as Select from '$lib/components/ui/select';
  import { GetValResColor } from '$lib/types/ValidationResult';
  import { elapsedToString } from '$lib/utils/time';

  interface Props {
    option?: string;
    customDate?: ZonedDateTime | undefined;
    date?: Date | null;
  }

  let {
    option = $bindable('never'),
    customDate = $bindable<ZonedDateTime | undefined>(undefined),
    date = $bindable<Date | null>(null),
  }: Props = $props();

  const inDays = (days: number) => () => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const expirationOptions: {
    value: string;
    label: string;
    getDate: () => Date | null;
  }[] = [
    { value: 'never', label: 'Never', getDate: () => null },
    {
      value: 'custom',
      label: 'Custom',
      getDate: () => (customDate !== undefined ? customDate.toDate() : null),
    },
    { value: '1days', label: '1 Day', getDate: inDays(1) },
    { value: '7days', label: '7 Days', getDate: inDays(7) },
    { value: '30days', label: '30 Days', getDate: inDays(30) },
    { value: '90days', label: '90 Days', getDate: inDays(90) },
    { value: '180days', label: '180 Days', getDate: inDays(180) },
    { value: '365days', label: '365 Days', getDate: inDays(365) },
  ];

  let selectedExpiration = $derived(expirationOptions.find((o) => o.value === option));
  let _date = $derived(selectedExpiration?.getDate() ?? null);
  $effect(() => {
    date = _date;
  });

  let validationResult = $derived(
    option === 'custom' && !customDate
      ? { valid: false, message: 'Expire date is required' }
      : { valid: true }
  );
</script>

<label>
  <span>Expiration</span>
  <Select.Root type="single" name="expiration" bind:value={option}>
    <Select.Trigger class="w-[180px]">
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
      <DateTimePicker bind:date={customDate} />
    </div>
  {/if}
  {#if 'message' in validationResult}
    <p class="text-xs text-{GetValResColor(validationResult)}">{validationResult.message}</p>
  {:else if option === 'never'}
    <p class="text-xs">The token will never expire</p>
  {:else if date}
    <p class="text-xs" aria-label={date.toLocaleString()}>
      The token will expire {elapsedToString(date.getTime() - Date.now())} ({date.toLocaleString()})
    </p>
  {/if}
</label>
