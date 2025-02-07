<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { ShareLink } from './columns';

  type Props = {
    open: boolean;
    sharelink: ShareLink;
  };

  let { open = $bindable<boolean>(), sharelink }: Props = $props();

  function deleteShareLink() {
    console.log('deleteShareLink');
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete sharelink</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete <strong>{sharelink.name}</strong>?
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={deleteShareLink}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>
