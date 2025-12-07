<script lang="ts">
  import type { ZonedDateTime } from '@internationalized/date';
  import { apiTokensApi } from '$lib/api';
  import { PermissionType, type TokenCreatedResponse } from '$lib/api/internal/v1';
  import DateTimePicker from '$lib/components/datetime-picker/date-time-picker.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Select from '$lib/components/ui/select';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { elapsedToString } from '$lib/utils';

  interface Props {
    open: boolean;
    onCreated: (token: TokenCreatedResponse) => void;
  }

  let { open = $bindable(), onCreated }: Props = $props();

  let name = $state<string>('');
  let expire = $state<'never' | `${number}days` | 'custom'>('never');
  let expireCustom = $state<ZonedDateTime | undefined>(undefined);
  let permissions = $state<PermissionType[]>([PermissionType.ShockersUse]);

  function onOpenChange(o: boolean) {
    // Stupid hack because when this dialog closes its state is never cleared... ._.
    if (!o) {
      name = '';
      expire = 'never';
      expireCustom = undefined;
      permissions = [PermissionType.ShockersUse];
    }
    open = o;
  }

  type PermissionCategory = {
    name: string;
    perms: { name: string; key: string }[];
  };

  const permissionCategories = Object.values(PermissionType).reduce(
    (acc: PermissionCategory[], v) => {
      const [category, perm] = v.split('.');
      const cat = acc.find((c) => c.name === category);
      if (cat) {
        cat.perms.push({ name: perm, key: v });
      } else {
        acc.push({ name: category, perms: [{ name: perm, key: v }] });
      }
      return acc;
    },
    []
  );

  function nameValidation(name: string): ValidationResult {
    if (name.length === 0) {
      return { valid: false, message: 'Name is required' };
    }

    if (name.length > 32) {
      return { valid: false, message: 'Name is too long' };
    }

    return { valid: true };
  }

  function expireValidation(
    expire: string,
    expireCustom: ZonedDateTime | undefined
  ): ValidationResult {
    if (expire === 'custom' && !expireCustom) {
      return { valid: false, message: 'Expire date is required' };
    }
    return { valid: true };
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let nameValidationResult = $derived(nameValidation(name));
  let expireValidationResult = $derived(expireValidation(expire, expireCustom));

  const expirationOptions = [
    { value: 'never', label: 'Never', getDate: () => null },
    {
      value: 'custom',
      label: 'Custom',
      getDate: () => (expireCustom !== undefined ? expireCustom.toDate() : null),
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

  let selectedExpiration = $derived(expirationOptions.find((option) => option.value === expire));
  let expireDate = $derived(selectedExpiration?.getDate());

  async function onFormSubmit() {
    const validUntil = expireDate == undefined ? null : expireDate;

    try {
      const createdToken = await apiTokensApi.tokensCreateToken({ name, validUntil, permissions });
      onCreated(createdToken);
      open = false;
      onOpenChange(false);
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>New API Token</Dialog.Title>
      <Dialog.Description
        >Please make sure to select the appropriate permissions for the token.</Dialog.Description
      >
    </Dialog.Header>
    <form class="modal-form border-surface-500 rounded-container-token space-y-4">
      <TextInput
        label="Token Name"
        placeholder="Token name..."
        bind:value={name}
        validationResult={nameValidationResult}
      />

      <label>
        <span>Expiration</span>
        <Select.Root type="single" name="expiration" bind:value={expire}>
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

        {#if expire === 'custom'}
          <div class="my-2 w-1/2">
            <DateTimePicker bind:date={expireCustom} />
          </div>
        {/if}
        {#if 'message' in expireValidationResult}
          <p class="text-xs text-{GetValResColor(expireValidationResult)}">
            {expireValidationResult.message}
          </p>
        {:else if expire === 'never'}
          <p class="text-xs">The token will never expire</p>
        {:else if expireDate}
          <p class="text-xs" aria-label={expireDate.toLocaleString()}>
            The token will expire {elapsedToString(expireDate.getTime() - Date.now())} ({expireDate.toLocaleString()})
          </p>
        {/if}
      </label>

      <div class="mt-4">
        <h2>Permissions</h2>
        <div class="border-surface-500 mt-3 flex flex-col space-y-4 rounded-md border p-4">
          {#each permissionCategories as permission}
            <span>{capitalizeFirstLetter(permission.name)}</span>
            {#each permission.perms as perm}
              <label class="mt-0! ml-4">
                <input type="checkbox" class="checkbox" value={perm.key} bind:group={permissions} />
                {capitalizeFirstLetter(perm.name)}
              </label>
            {/each}
          {/each}
        </div>
      </div>
    </form>
    <Button onclick={onFormSubmit}>Generate</Button>
  </Dialog.Content>
</Dialog.Root>
