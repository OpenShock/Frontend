<script lang="ts">
  import { adminConfigurationUpdate } from '#lib/api/index.js';
  import type { ConfigurationItemDto } from '#lib/api/index.js';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    item: ConfigurationItemDto;
    onEdited: () => void;
  }

  let { open = $bindable<boolean>(), item, onEdited }: Props = $props();

  // svelte-ignore state_referenced_locally
  let description = $state(item.description);
  // svelte-ignore state_referenced_locally
  let value = $state(item.value);

  let valid = $derived(value.length > 0);
  let submitting = $state(false);

  async function onSubmit() {
    if (submitting) return;
    submitting = true;
    try {
      await adminConfigurationUpdate({ body: { name: item.name, description, value } });
      onEdited();
      toast.success('Updated configuration item');
      open = false;
    } catch (error) {
      await handleApiError(error);
    } finally {
      submitting = false;
    }
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit configuration item</Dialog.Title>
      <Dialog.Description>
        <strong>BE CAREFUL. This will alter the server's behaviour!</strong>
      </Dialog.Description>
    </Dialog.Header>
    <TextInput label="Description" bind:value={description} />
    <TextInput label="Value" bind:value />
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={onSubmit} disabled={submitting || !valid}>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
