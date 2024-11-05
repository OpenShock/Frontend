<script lang="ts">
  import { tokensApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import * as Dialog from '$lib/components/ui/dialog';
  import Button from '$lib/components/ui/button/button.svelte';
  import { PermissionType, type TokenResponse } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import type { ValidationResult } from '$lib/types/ValidationResult';

  type Props = {
    token: TokenResponse | null;
    onEdited: (id: string) => void;
    onClose: () => void;
  };

  let { token, onEdited, onClose }: Props = $props();

  let name = $state<string>('');
  let permissions = $state<PermissionType[]>([]);

  async function saveChanges() {
    if (!token) return;

    tokensApi
      .tokensEditToken(token.id, { name, permissions })
      .then(() => onEdited(token.id))
      .catch(handleApiError);
  }

  function handleOpenChanged(open: boolean) {
    if (!open) {
      onClose();
    }
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  type PermissionCategory = {
    name: string;
    perms: { name: string; key: string }[];
  };

  const permissionTypes = Object.values(PermissionType)
    .filter((v) => v !== PermissionType.unknownDefaultOpenApi)
    .reduce((acc: PermissionCategory[], v) => {
      const [category, perm] = v.split('.');
      const cat = acc.find((c) => c.name === category);
      if (cat) {
        cat.perms.push({ name: capitalizeFirstLetter(perm), key: v });
      } else {
        acc.push({ name: capitalizeFirstLetter(category), perms: [{ name: perm, key: v }] });
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

  let nameValidationResult = $derived(nameValidation(name));
</script>

<Dialog.Root open={token !== null} onOpenChange={handleOpenChanged} controlledOpen={true}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit API Token</Dialog.Title>
      <Dialog.Description></Dialog.Description>
    </Dialog.Header>
    <form class="space-y-8">
      <TextInput
        label="Token Name"
        placeholder="Enter a Token name... e.g. ShockOSC"
        bind:value={name}
        validationResult={nameValidationResult}
      />

      <div>
        <h2>Permissions</h2>
        <div class="border rounded-md border-surface-500 p-4 space-y-4">
          {#each permissionTypes as category}
            <span>{category.name}</span>
            {#each category.perms as permission}
              <label class="!mt-0 ml-4">
                <input
                  type="checkbox"
                  class="checkbox"
                  value={permission.key}
                  bind:group={permissions}
                />
                {permission.name}
              </label>
            {/each}
          {/each}
        </div>
      </div>
    </form>

    <Button variant="default" onclick={saveChanges}>Save Changes</Button>
  </Dialog.Content>
</Dialog.Root>
