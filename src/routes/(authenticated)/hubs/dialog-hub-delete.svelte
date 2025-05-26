<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { Hub } from './columns';

  interface Props {
    open: boolean;
    hub: Hub;
  }

  let { open = $bindable<boolean>(), hub }: Props = $props();

  function deleteHub() {
    console.log('deleteHub');
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete hub</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete <strong>{hub.name}</strong>?
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={deleteHub}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>
