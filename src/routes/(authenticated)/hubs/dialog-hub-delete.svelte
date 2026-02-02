<script lang="ts">
  import { hubManagementV1Api } from '$lib/api';
  import { Badge } from '$lib/components/ui/badge';
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
      <Dialog.Title>Are you sure?</Dialog.Title>
      <Dialog.Description>
        You are about to delete hub "<strong>{hub.name}</strong>"<br />
        This will also delete the following shockers:
        <div class="pt-2 flex gap-2 text-sm justify-center sm:justify-start">
          {#each hub.shockers as shocker}
            <Badge>{shocker.name}</Badge>
          {/each}
        </div>
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={deleteHub}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>
