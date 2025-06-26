<script lang="ts">
  import { hubManagementV1Api } from '$lib/api';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { Hub } from './columns';

  interface Props {
    open: boolean;
    hub: Hub;
  }

  let { open = $bindable<boolean>(), hub }: Props = $props();

  function deleteHub() {
    hubManagementV1Api
      .devicesRemoveDevice(hub.id)
      .then(() => (open = false))
      .catch(handleApiError);
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete hub</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete <strong>{hub.name}</strong>?<br />
        <strong>This action is irreversible.</strong>
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={deleteHub}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>
