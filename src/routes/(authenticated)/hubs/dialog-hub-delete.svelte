<script lang="ts">
  import type { Hub } from './columns';
  import * as Dialog from '$lib/components/ui/dialog';
  import Button from '$lib/components/ui/button/button.svelte';

  type Props = {
    open: boolean;
    hub: Hub;
  };

  let { open = $bindable<boolean>(), hub }: Props = $props();

  function deleteHub() {
    console.log('deleteHub');
  }
</script>

<Dialog.Root {open} onOpenChange={(o) => (open = o)} controlledOpen={true}>
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
