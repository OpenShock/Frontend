<script lang="ts">
  import {
    type AutomationTokenType,
    type PatchAutomationTokenDto,
    adminPatchAutomationToken,
  } from '#lib/api/index.js';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import MultiSelectCombobox from '@openshock/svelte-core/components/multi-select-combobox/multi-select-combobox.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import type { ValidationResult } from '@openshock/svelte-core/types';
  import { toast } from 'svelte-sonner';
  import AutoCleanupFields from './auto-cleanup-fields.svelte';
  import { type AutomationToken, automationTokenTypes, formatTokenType } from './columns';

  const NAME_MAX_LENGTH = 64;

  interface Props {
    open: boolean;
    token: AutomationToken;
    onEdited: () => void;
  }

  let { open = $bindable<boolean>(), token, onEdited }: Props = $props();

  const typeOptions = automationTokenTypes.map((type) => ({
    value: type,
    label: formatTokenType(type),
  }));

  // svelte-ignore state_referenced_locally
  let name = $state(token.name);
  // svelte-ignore state_referenced_locally
  let selectedTypes = $state<string[]>([...token.types]);
  // svelte-ignore state_referenced_locally
  let autoCleanupUsers = $state(token.autoCleanup.enabled);
  // svelte-ignore state_referenced_locally
  let autoCleanupAfter = $state<string | null>(token.autoCleanup.after);
  let autoCleanupValid = $state(true);
  let isSubmitting = $state(false);

  let nameValidation = $derived.by<ValidationResult>(() => {
    if (name.length === 0) return { valid: false, message: 'Required' };
    if (name.length > NAME_MAX_LENGTH) {
      return { valid: false, message: `At most ${NAME_MAX_LENGTH} characters` };
    }
    return { valid: true };
  });

  let sameTypes = $derived(
    selectedTypes.length === token.types.length &&
      token.types.every((type) => selectedTypes.includes(type))
  );

  let patch = $derived.by<PatchAutomationTokenDto>(() => {
    // Every field is nullable and null means "leave as it is", so only the ones
    // that actually changed are sent. That also means the interval cannot be
    // cleared on its own — switching cleanup off is what stops accounts expiring.
    const body: PatchAutomationTokenDto = {};
    if (name !== token.name) body.name = name;
    if (!sameTypes) body.types = selectedTypes as AutomationTokenType[];
    if (autoCleanupUsers !== token.autoCleanup.enabled) body.autoCleanupUsers = autoCleanupUsers;
    if (
      autoCleanupUsers &&
      autoCleanupAfter !== null &&
      autoCleanupAfter !== token.autoCleanup.after
    ) {
      body.autoCleanupAfter = autoCleanupAfter;
    }
    return body;
  });

  let hasChanges = $derived(Object.keys(patch).length > 0);

  let valid = $derived(
    nameValidation.valid &&
      selectedTypes.length > 0 &&
      autoCleanupValid &&
      hasChanges &&
      !isSubmitting
  );

  function applyChanges() {
    isSubmitting = true;
    adminPatchAutomationToken({ path: { id: token.id }, body: patch })
      .then(() => {
        onEdited();
        toast.success('Updated automation token');
        open = false;
      })
      .catch(handleApiError)
      .finally(() => (isSubmitting = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit automation token</Dialog.Title>
      <Dialog.Description>
        Changing what <strong>{token.name}</strong> bypasses takes effect on its next use. The secret
        is unchanged — rotate the token to replace it.
      </Dialog.Description>
    </Dialog.Header>

    <TextInput label="Name" bind:value={name} validationResult={nameValidation} />

    <MultiSelectCombobox
      bind:selected={selectedTypes}
      options={typeOptions}
      label="Bypasses"
      placeholder="Search protections..."
      selectText="Select protections"
      noMatchText="No matching protections"
    />

    <AutoCleanupFields
      bind:enabled={autoCleanupUsers}
      bind:after={autoCleanupAfter}
      bind:valid={autoCleanupValid}
    />

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={applyChanges} disabled={!valid}>Apply</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
