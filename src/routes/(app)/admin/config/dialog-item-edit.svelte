<script lang="ts">
  import { adminConfigurationUpdate } from '$lib/api';
  import type { ConfigurationItemDto } from '$lib/api';
  import { TextInput } from '@openshock/svelte-core/components/input/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
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

  function onSubmit() {
    adminConfigurationUpdate({ body: { name: item.name, description, value } })
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
