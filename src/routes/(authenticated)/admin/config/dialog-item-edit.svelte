<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { ConfigurationItemDto } from '$lib/api/internal/v1';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    item: ConfigurationItemDto;
    onEdited: () => void;
  }

  let { open = $bindable<boolean>(), item, onEdited }: Props = $props();

  let description = $state(item.description);
  let value = $state(item.value);

  let valid = $derived(value.length > 0);

  function onSubmit() {
    adminApi
      .adminConfigurationUpdate({ name: item.name, description, value })
      .then(() => {
        onEdited();
        toast.success('Created configuration item');
        open = false;
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add configuration item</Dialog.Title>
      <Dialog.Description>
        <strong>BE CAREFUL. This will alter the server's behaviour!</strong>
      </Dialog.Description>
    </Dialog.Header>
    <TextInput label="Description" bind:value={description} />
    <TextInput label="Value" bind:value />
    <Button onclick={onSubmit} disabled={!valid}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
