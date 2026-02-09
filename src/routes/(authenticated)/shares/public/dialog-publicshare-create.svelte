<script lang="ts">
  import { type DateValue, ZonedDateTime, getLocalTimeZone } from '@internationalized/date';
  import { publicShockerSharesApi } from '$lib/api';
  import DateTimePicker from '$lib/components/datetime-picker/date-time-picker.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Select from '$lib/components/ui/select';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { elapsedToString } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onCreated: () => void;
  }

  let { open = $bindable<boolean>(), onCreated }: Props = $props();

  const expirationOptions = [
    { value: 'never', label: 'Never', getDate: () => null },
    {
      value: 'custom',
      label: 'Custom',
      getDate: () => (customExpire !== undefined ? customExpire.toDate() : null),
    }, // see GetExpireDate
    {
      value: '1days',
      label: '1 Day',
      getDate: () => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      value: '7days',
      label: '7 Days',
      getDate: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      value: '30days',
      label: '30 Days',
      getDate: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      value: '90days',
      label: '90 Days',
      getDate: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      value: '180days',
      label: '180 Days',
      getDate: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
    {
      value: '365days',
      label: '365 Days',
      getDate: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  ];

  function expireValidation(
    expire: string,
    expireCustom: ZonedDateTime | undefined
  ): ValidationResult {
    if (expire === 'custom' && !expireCustom) {
      return { valid: false, message: 'Expire date is required' };
    }
    return { valid: true };
  }

  let name = $state('');
  let expireOption = $state('never');
  let customExpire = $state<ZonedDateTime | undefined>();
  let expireValidationResult = $derived(expireValidation(expireOption, customExpire));
  let selectedExpiration = $derived(
    expirationOptions.find((option) => option.value === expireOption)
  );
  let expireDate = $derived(selectedExpiration?.getDate());

  function createShareLink() {
    publicShockerSharesApi
      .shareLinksCreatePublicShare({
        name,
        expiresOn: expireDate,
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
            {#each expirationOptions as option}
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
      {:else if expireDate}
        <p class="text-xs" aria-label={expireDate.toLocaleString()}>
          The token will expire {elapsedToString(expireDate.getTime() - Date.now())} ({expireDate.toLocaleString()})
        </p>
      {/if}
    </label>

    <Button onclick={createShareLink}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
