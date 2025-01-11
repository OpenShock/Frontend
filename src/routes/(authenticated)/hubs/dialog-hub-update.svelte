<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import type { Hub } from './columns';

  type Props = {
    open: boolean;
    hub: Hub;
  };

  let { open = $bindable<boolean>(), hub }: Props = $props();
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Update hub</Dialog.Title>
      <Dialog.Description>This is the dialog for updating a hub.</Dialog.Description>
    </Dialog.Header>
    TODO: Implement OTA update form thing
  </Dialog.Content>
</Dialog.Root>
