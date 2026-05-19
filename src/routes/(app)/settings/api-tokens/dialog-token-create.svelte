<script lang="ts" module>
  import { PermissionType, tokensCreateToken } from '$lib/api';
  import type { TokenCreatedResponse } from '$lib/api';
  import type { ValidationResult } from '$lib/types/ValidationResult';

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

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
</script>

<script lang="ts">
  import ExpirationPicker from '$lib/components/ExpirationPicker.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  interface Props {
    open: boolean;
    onCreated: (token: TokenCreatedResponse) => void;
  }

  let { open = $bindable(), onCreated }: Props = $props();

  let name = $state<string>('');
  let expire = $state('never');
  let expireInstant = $state<Temporal.Instant | null>(null);
  let permissions = $state<PermissionType[]>([PermissionType.ShockersUse]);

  function onOpenChange(o: boolean) {
    // Stupid hack because when this dialog closes its state is never cleared... ._.
    if (!o) {
      name = '';
      expire = 'never';

      permissions = [PermissionType.ShockersUse];
    }
    open = o;
  }

  let nameValidationResult = $derived(nameValidation(name));

  async function onFormSubmit() {
    try {
      const createdToken = await tokensCreateToken({
        body: { name, validUntil: expireInstant, permissions },
      });
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

      <ExpirationPicker bind:option={expire} bind:instant={expireInstant} />

      <div class="mt-4">
        <h2>Permissions</h2>
        <div class="border-surface-500 mt-3 flex flex-col space-y-4 rounded-md border p-4">
          {#each permissionCategories as permission (permission.name)}
            <span>{capitalizeFirstLetter(permission.name)}</span>
            {#each permission.perms as perm (perm.key)}
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
