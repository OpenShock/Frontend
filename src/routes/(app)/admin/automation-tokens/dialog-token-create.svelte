<script lang="ts">
  import {
    type AutomationTokenType,
    type CreatedAutomationTokenDto,
    adminCreateAutomationToken,
  } from '#lib/api/index.js';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import MultiSelectCombobox from '@openshock/svelte-core/components/multi-select-combobox/multi-select-combobox.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import type { ValidationResult } from '@openshock/svelte-core/types';
  import { toast } from 'svelte-sonner';
  import AutoCleanupFields from './auto-cleanup-fields.svelte';
  import { automationTokenTypes, formatTokenType } from './columns';
  import SecretRevealDialog from './dialog-secret-reveal.svelte';

  const NAME_MAX_LENGTH = 64;

  interface Props {
    open: boolean;
    onCreated: () => void;
  }

  let { open = $bindable<boolean>(), onCreated }: Props = $props();

  const typeOptions = automationTokenTypes.map((type) => ({
    value: type,
    label: formatTokenType(type),
  }));

  let name = $state('');
  let selectedTypes = $state<string[]>([]);
  let autoCleanupUsers = $state(false);
  let autoCleanupAfter = $state<string | null>(null);
  let autoCleanupValid = $state(true);
  let isSubmitting = $state(false);

  /** Set once the token exists; the secret it holds is never returned again. */
  let created = $state<CreatedAutomationTokenDto | null>(null);

  let nameValidation = $derived.by<ValidationResult>(() => {
    if (name.length === 0) return { valid: false };
    if (name.length > NAME_MAX_LENGTH) {
      return { valid: false, message: `At most ${NAME_MAX_LENGTH} characters` };
    }
    return { valid: true };
  });

  // The API requires at least one type — a token that bypasses nothing is rejected.
  let valid = $derived(
    nameValidation.valid && selectedTypes.length > 0 && autoCleanupValid && !isSubmitting
  );

  function reset() {
    name = '';
    selectedTypes = [];
    autoCleanupUsers = false;
    autoCleanupAfter = null;
  }

  function createToken() {
    isSubmitting = true;
    adminCreateAutomationToken({
      body: {
        name,
        types: selectedTypes as AutomationTokenType[],
        autoCleanupUsers,
        autoCleanupAfter,
      },
    })
      .then((token) => {
        // Close this dialog first so the one-time secret is the only thing on screen.
        open = false;
        reset();
        created = token;
        onCreated();
        toast.success('Created automation token');
      })
      .catch(handleApiError)
      .finally(() => (isSubmitting = false));
  }
</script>

<SecretRevealDialog
  token={created}
  title="Automation token created"
  onDismiss={() => (created = null)}
/>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create automation token</Dialog.Title>
      <Dialog.Description>
        An automation token lets its holder bypass the protections selected below. The secret is
        shown once, right after creation.
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
      <Button onclick={createToken} disabled={!valid}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
