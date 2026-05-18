<script lang="ts" module>
  import type { ZonedDateTime } from '@internationalized/date';
  import type { ValidationResult } from '$lib/types/ValidationResult';

  function expireValidation(
    expire: string,
    expireCustom: ZonedDateTime | undefined
  ): ValidationResult {
    if (expire === 'custom' && !expireCustom) {
      return { valid: false, message: 'Expire date is required' };
    }
    return { valid: true };
  }
</script>

<script lang="ts">
  import { shareLinksCreatePublicShare } from '$lib/api';
  import DateTimePicker from '$lib/components/datetime-picker/date-time-picker.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Select from '$lib/components/ui/select';
  import { GetValResColor } from '$lib/types/ValidationResult';
  import { durationBetween, formatElapsed, instantFromDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onCreated: () => void;
  }

  let { open = $bindable<boolean>(), onCreated }: Props = $props();

  let name = $state('');
  let expireOption = $state('never');
  let customExpire = $state<ZonedDateTime | undefined>();

  const inDays = (days: number) => () => Temporal.Now.instant().add({ hours: days * 24 });

  const expirationOptions: {
    value: string;
    label: string;
    getInstant: () => Temporal.Instant | null;
  }[] = [
    { value: 'never', label: 'Never', getInstant: () => null },
    {
      value: 'custom',
      label: 'Custom',
      getInstant: () =>
        customExpire !== undefined ? instantFromDate(customExpire.toDate()) : null,
    },
    { value: '1days', label: '1 Day', getInstant: inDays(1) },
    { value: '7days', label: '7 Days', getInstant: inDays(7) },
    { value: '30days', label: '30 Days', getInstant: inDays(30) },
    { value: '90days', label: '90 Days', getInstant: inDays(90) },
    { value: '180days', label: '180 Days', getInstant: inDays(180) },
    { value: '365days', label: '365 Days', getInstant: inDays(365) },
  ];

  let expireValidationResult = $derived(expireValidation(expireOption, customExpire));
  let selectedExpiration = $derived(
    expirationOptions.find((option) => option.value === expireOption)
  );
  let expireInstant = $derived(selectedExpiration?.getInstant() ?? null);

  function createShareLink() {
    shareLinksCreatePublicShare({
      body: { name, expiresOn: expireInstant ?? undefined },
    })
      .then(() => {
        onCreated();
        toast.success('Created new publicshare');
      })
      .finally(() => {
        open = false;
      });
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create Public Share</Dialog.Title>
    </Dialog.Header>
    <TextInput label="Name" bind:value={name} />

    <label>
      <span>Expiration</span>
      <Select.Root type="single" name="expiration" bind:value={expireOption}>
        <Select.Trigger class="w-[180px]">
          {selectedExpiration?.label}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each expirationOptions as option (option.label)}
              <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      {#if expireOption === 'custom'}
        <div class="my-2 w-1/2">
          <DateTimePicker bind:date={customExpire} />
        </div>
      {/if}
      {#if 'message' in expireValidationResult}
        <p class="text-xs text-{GetValResColor(expireValidationResult)}">
          {expireValidationResult.message}
        </p>
      {:else if expireOption === 'never'}
        <p class="text-xs">The token will never expire</p>
      {:else if expireInstant}
        <p class="text-xs" aria-label={expireInstant.toLocaleString()}>
          The token will expire {formatElapsed(
            durationBetween(Temporal.Now.instant(), expireInstant)
          )}
          ({expireInstant.toLocaleString()})
        </p>
      {/if}
    </label>

    <Button onclick={createShareLink}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
