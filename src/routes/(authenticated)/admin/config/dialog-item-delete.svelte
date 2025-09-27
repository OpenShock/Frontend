<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { ConfigurationItemDto } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    item: ConfigurationItemDto;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), item, onDeleted }: Props = $props();

  function onSubmit() {
    adminApi
      .adminConfigurationDelete(item.name)
      .then(() => {
        onDeleted();
        toast.success('Removed item');
        open = false;
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete configuration item</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete <strong>{item.name}</strong>?<br />
        <strong>This action is irreversible.</strong>
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={onSubmit}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>
