<script lang="ts">
  import { apiTokensApi } from '$lib/api';
  import { PermissionType, type TokenResponse } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    token: TokenResponse;
    onEdit: (id: string, updater: (token: TokenResponse) => TokenResponse) => void;
  }

  let { open = $bindable(), token, onEdit }: Props = $props();

  // svelte-ignore state_referenced_locally
  let name = $state(token.name);
  // svelte-ignore state_referenced_locally
  let permissions = $state(token.permissions);

  async function saveChanges() {
    try {
      await apiTokensApi.tokensEditToken(token.id, { name, permissions });
      onEdit(token.id, (token) => {
        return {
          ...token,
          name,
          permissions,
        };
      });
      toast.success('Token edited successfully');
      open = false;
    } catch (error) {
      await handleApiError(error);
    }
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

  let nameValidationResult = $derived(nameValidation(name));
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit API Token</Dialog.Title>
      <Dialog.Description></Dialog.Description>
    </Dialog.Header>
    <form class="modal-form border-surface-500 rounded-container-token space-y-4">
      <TextInput
        label="Token Name"
        placeholder="Token name..."
        bind:value={name}
        validationResult={nameValidationResult}
      />

      <div class="mt-4">
        <h2>Permissions</h2>
        <div class="border-surface-500 mt-3 flex flex-col space-y-4 rounded-md border p-4">
          {#each permissionCategories as permission}
            <span class="capitalize">{permission.name}</span>
            {#each permission.perms as perm}
              <label class="mt-0! ml-4">
                <input
                  type="checkbox"
                  class="checkbox capitalize"
                  value={perm.key}
                  bind:group={permissions}
                />
                {perm.name}
              </label>
            {/each}
          {/each}
        </div>
      </div>
    </form>

    <Button variant="default" onclick={saveChanges} disabled={!nameValidationResult.valid}>
      Save Changes
    </Button>
  </Dialog.Content>
</Dialog.Root>
