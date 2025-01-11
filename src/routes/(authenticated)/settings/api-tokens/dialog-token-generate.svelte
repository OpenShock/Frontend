<script lang="ts">
  import { tokensApi } from '$lib/api';
  import { PermissionType } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { toast } from 'svelte-sonner';
  import TokenCreatedDialog from './dialog-token-created.svelte';
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectGroupHeading,
    SelectItem,
    SelectTrigger,
  } from '$lib/components/ui/select';

  type Props = {
    open: boolean;
    onGenerated: (id: string) => void;
  };

  let { open = $bindable(), onGenerated }: Props = $props();

  let name = $state<string>('');
  let expire = $state<'never' | `${number}days` | 'custom'>('never');
  let expireCustom = $state<Date | null>(null);
  let permissions = $state<PermissionType[]>([PermissionType.ShockersUse]);
  let token = $state<string | null>(null);

  function getExpireDate(expireType: string, customExpireDate: Date | null): Date | null {
    switch (expireType) {
      case 'never':
        return null;
      case '7days':
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      case '60days':
        return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      case '90days':
        return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      case 'custom':
        return customExpireDate;
    }
    return null;
  }

  async function onFormSubmit() {
    const expireDate = getExpireDate(expire, expireCustom);

    const validUntil = expireDate == null ? undefined : expireDate;

    tokensApi
      .tokensCreateToken({ name, validUntil, permissions })
      .then((res) => {
        if (!res.token) {
          toast.error('Received invalid response from server');
          return;
        }
        token = res.token;
        onGenerated(res.id);
        toast.success('Token created successfully');
        open = false;
        createdDialog = true;
      })
      .catch(handleApiError);
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

    if (name.length > 64) {
      return { valid: false, message: 'Name is too long' };
    }

    return { valid: true };
  }

  function expireValidation(expire: string, expireCustom: Date | null): ValidationResult {
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

  let createdDialog = $state(false);
</script>

<TokenCreatedDialog bind:open={createdDialog} {token} />

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Generate a new API Token</Dialog.Title>
      <Dialog.Description>Example text</Dialog.Description>
    </Dialog.Header>
    <form class="modal-form border-surface-500 rounded-container-token space-y-4 border p-4">
      <TextInput
        label="Token Name"
        placeholder="Token name..."
        bind:value={name}
        validationResult={nameValidationResult}
      />

      <label>
        <span>Expiration</span>
        <Select type="single" name="expiration" bind:value={expire}>
          <SelectTrigger class="w-[180px]">
            {expire}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="never" label="Never">Never</SelectItem>
              <SelectItem value="7days" label="7 days">7 days</SelectItem>
              <SelectItem value="30days" label="30 days">30 days</SelectItem>
              <SelectItem value="60days" label="60 days">60 days</SelectItem>
              <SelectItem value="90days" label="90 days">90 days</SelectItem>
              <SelectItem value="custom" label="Custom...">Custom...</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div class="flex items-center gap-3">
          {#if expire === 'custom'}
            <!--
            <Calendar
              type="single"
              value={expireCustom as DateValue}
              bind:placeholder
              minValue={new CalendarDate(Date.now())}
              maxValue={today(getLocalTimeZone())}
              calendarLabel="Expiration Date"
              onValueChange={(v) => {
                if (v) {
                  expireCustom = v.toDate(getLocalTimeZone());
                } else {
                  expireCustom = null;
                }
              }}
            />
            -->
            <input class="input w-1/2" type="datetime-local" bind:value={expireCustom} />
          {:else if expire !== 'never'}
            <p>Expire on {getExpireDate(expire, expireCustom)?.toLocaleString()}</p>
          {:else}
            <p>The token will never expire</p>
          {/if}
        </div>
        {#if 'message' in expireValidationResult}
          <p class="text-xs text-{GetValResColor(expireValidationResult)} !mt-0">
            {expireValidationResult.message}
          </p>
        {:else}
          <div class="h-3"></div>
        {/if}
      </label>

      <div>
        <h2>Permissions</h2>
        <div class="border-surface-500 flex flex-col space-y-4 rounded-md border p-4">
          {#each permissionCategories as permission}
            <span>{capitalizeFirstLetter(permission.name)}</span>
            {#each permission.perms as perm}
              <label class="!mt-0 ml-4">
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
