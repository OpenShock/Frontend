<script lang="ts" module>
  import { type TimeSpanUnit, timeSpanUnitSeconds } from '#lib/utils/index.js';

  const DEFAULT_SECONDS = 7 * 24 * 60 * 60;

  const unitOptions: { value: TimeSpanUnit; label: string }[] = [
    { value: 'day', label: 'days' },
    { value: 'hour', label: 'hours' },
    { value: 'minute', label: 'minutes' },
    { value: 'second', label: 'seconds' },
  ];
</script>

<script lang="ts">
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { Label } from '@openshock/svelte-core/components/ui/label';
  import * as Select from '@openshock/svelte-core/components/ui/select';
  import { Switch } from '@openshock/svelte-core/components/ui/switch';
  import { largestWholeUnit, parseTimeSpanSeconds, timeSpanFromSeconds } from '#lib/utils/index.js';

  interface Props {
    /** Whether accounts this token created are deleted once the interval has passed. */
    enabled: boolean;
    /** The interval, as a .NET TimeSpan, or null when cleanup is off. */
    after: string | null;
    /** False while cleanup is on but the interval isn't a positive whole number. */
    valid: boolean;
  }

  const id = $props.id();

  let {
    enabled = $bindable(),
    after = $bindable(),
    // eslint-disable-next-line no-useless-assignment -- $bindable fallback, not a dead assignment
    valid = $bindable(true),
  }: Props = $props();

  // Seeded from the token being edited, then owned here; `after` is written back
  // from these two fields, never read into them again.
  const initial = largestWholeUnit(parseTimeSpanSeconds(after ?? '') ?? DEFAULT_SECONDS);

  let amountText = $state(initial.value.toString());
  let unit = $state<TimeSpanUnit>(initial.unit);

  let amount = $derived(Number(amountText));
  let amountValid = $derived(Number.isSafeInteger(amount) && amount > 0);

  let unitLabel = $derived(unitOptions.find((o) => o.value === unit)?.label ?? unit);

  $effect(() => {
    valid = !enabled || amountValid;
    after = enabled && amountValid ? timeSpanFromSeconds(amount * timeSpanUnitSeconds[unit]) : null;
  });
</script>

<div class="flex flex-col gap-3 rounded-md border p-4">
  <div class="flex items-center justify-between gap-4">
    <Label for="{id}-enabled" class="flex flex-col items-start gap-1">
      <span>Clean up created accounts</span>
      <span class="text-muted-foreground text-xs font-normal">
        Accounts this token did not create are never deleted.
      </span>
    </Label>
    <Switch id="{id}-enabled" bind:checked={enabled} />
  </div>

  {#if enabled}
    <div class="flex items-end gap-2">
      <div class="flex flex-1 flex-col gap-2">
        <Label for="{id}-amount">Delete after</Label>
        <Input
          id="{id}-amount"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          bind:value={amountText}
          aria-invalid={amountValid ? undefined : 'true'}
        />
      </div>
      <Select.Root type="single" bind:value={unit}>
        <Select.Trigger class="w-[130px]">{unitLabel}</Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Unit</Select.Label>
            {#each unitOptions as option (option.value)}
              <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
    {#if !amountValid}
      <p class="text-destructive text-xs">Enter a whole number of {unitLabel} greater than zero.</p>
    {/if}
  {/if}
</div>
