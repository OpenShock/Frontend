<script lang="ts">
  import { PermissionType, tokensEditTokenV2 } from '$lib/api';
  import type { ShockerControlSettings, TokenResponseV2 } from '$lib/api';
  import type { DialogContentProps } from '@openshock/svelte-core/components/dialog-manager';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { ValidationResult } from '@openshock/svelte-core/types/ValidationResult.js';
  import { toast } from 'svelte-sonner';
  import ShockerControlSettingsEditor from './shocker-control-settings.svelte';

  export type TokenEditResult = Pick<TokenResponseV2, 'name' | 'permissions' | 'shockerControl'>;

  interface Props extends DialogContentProps<TokenEditResult | undefined> {
    token: TokenResponseV2;
  }

  let { token, resolve }: Props = $props();

  // svelte-ignore state_referenced_locally
  let name = $state(token.name);
  // svelte-ignore state_referenced_locally
  let permissions = $state(token.permissions);
  let shockerControl = $state<ShockerControlSettings>(
    // svelte-ignore state_referenced_locally
    structuredClone($state.snapshot(token.shockerControl))
  );
  let submitting = $state(false);

  async function saveChanges() {
    submitting = true;
    try {
      await tokensEditTokenV2({
        path: { tokenId: token.id },
        body: { name, permissions, shockerControl },
      });
      toast.success('Token edited successfully');
      resolve({ name, permissions, shockerControl });
    } catch (error) {
      await handleApiError(error);
    } finally {
      submitting = false;
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

<div class="max-h-[80vh] space-y-4 overflow-y-auto pr-1">
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
        {#each permissionCategories as permission (permission.name)}
          <span class="capitalize">{permission.name}</span>
          {#each permission.perms as perm (perm.key)}
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

    <div class="mt-4">
      <h2>Shocker Control</h2>
      <div class="mt-3">
        <ShockerControlSettingsEditor bind:settings={shockerControl} />
      </div>
    </div>
  </form>

  <Button
    variant="default"
    onclick={saveChanges}
    disabled={submitting || !nameValidationResult.valid}
  >
    Save Changes
  </Button>
</div>
