<script lang="ts">
  import { tokensApi } from '$lib/api';
  import { PermissionType } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { GetValResColor, type ValidationResult } from '$lib/types/ValidationResult';
  import { toast } from 'svelte-sonner';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import Button from '$lib/components/ui/button/button.svelte';
  import TokenCreatedDialog from './token-created-dialog.svelte';
  import * as Dialog from '$lib/components/ui/dialog';

  type Props = {
    open: boolean;
    onGenerated: (id: string) => void;
    onClose: () => void;
  };

  let { open, onGenerated, onClose }: Props = $props();

  let name = $state<string>('');
  let expire = $state<'never' | `${number}days` | 'custom'>('never');
  let expireCustom = $state<Date | null>(null);
  let permissions = $state<PermissionType[]>([PermissionType.shockersUse]);
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
        onGenerated(res.token);
        toast.success('Token created successfully');
      })
      .catch(handleApiError);
  }

  type PermissionCategory = {
    name: string;
    perms: { name: string; key: string }[];
  };

  const permissionCategories = Object.values(PermissionType)
    .filter((v) => v !== PermissionType.unknownDefaultOpenApi)
    .reduce((acc: PermissionCategory[], v) => {
      const [category, perm] = v.split('.');
      const cat = acc.find((c) => c.name === category);
      if (cat) {
        cat.perms.push({ name: perm, key: v });
      } else {
        acc.push({ name: category, perms: [{ name: perm, key: v }] });
      }
      return acc;
    }, []);

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

  function copyToken() {
    if (token == null) return;
    navigator.clipboard.writeText(token);
    toast.success('Token copied to clipboard');
  }

  function handleOpenChanged(open: boolean) {
    if (!open) {
      onClose();
    }
  }

  let nameValidationResult = $derived(nameValidation(name));
  let expireValidationResult = $derived(expireValidation(expire, expireCustom));
</script>

<TokenCreatedDialog {token} {onClose} />

<Dialog.Root {open} onOpenChange={handleOpenChanged} controlledOpen={true}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Generate a new API Token</Dialog.Title>
      <Dialog.Description>Example text</Dialog.Description>
    </Dialog.Header>
    <form class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token">
      <TextInput
        label="Token Name"
        placeholder="Token name..."
        bind:value={name}
        validationResult={nameValidationResult}
      />

      <!--
      <Form.Field {form} name="dob" class="flex flex-col">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Date of birth</Form.Label>
            <Popover.Root>
              <Popover.Trigger
                {...props}
                class={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-[280px] justify-start pl-4 text-left font-normal',
                  !value && 'text-muted-foreground'
                )}
              >
                {value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
                <CalendarIcon class="ml-auto size-4 opacity-50" />
              </Popover.Trigger>
              <Popover.Content class="w-auto p-0" side="top">
                <Calendar
                  type="single"
                  value={value as DateValue}
                  bind:placeholder
                  minValue={new CalendarDate(1900, 1, 1)}
                  maxValue={today(getLocalTimeZone())}
                  calendarLabel="Date of birth"
                  onValueChange={(v) => {
                    if (v) {
                      $formData.dob = v.toString();
                    } else {
                      $formData.dob = '';
                    }
                  }}
                />
              </Popover.Content>
            </Popover.Root>
            <Form.Description>Your date of birth is used to calculator your age</Form.Description>
            <Form.FieldErrors />
            <input hidden value={$formData.dob} name={props.name} />
          {/snippet}
        </Form.Control>
      </Form.Field>
      -->

      <label class="label">
        <span>Expiration</span>
        <div class="flex items-center gap-3">
          <select class="select w-1/2" bind:value={expire}>
            <option value="never">Never</option>
            <option value="7days">7 days</option>
            <option value="30days">30 days</option>
            <option value="60days">60 days</option>
            <option value="90days">90 days</option>
            <option value="custom">Custom...</option>
          </select>

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
        <div class="border rounded-md border-surface-500 p-4 space-y-4 flex flex-col">
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
