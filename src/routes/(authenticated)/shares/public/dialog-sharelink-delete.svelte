<script lang="ts">
  import { publicShockerSharesApi } from '$lib/api';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { toast } from 'svelte-sonner';

  type Props = {
    open: boolean;
    publicShare: OwnPublicShareResponse;
  };

  let { open = $bindable<boolean>(), publicShare }: Props = $props();

  function deleteShareLink() {
    publicShockerSharesApi
      .shareLinksDeletePublicShare(publicShare.id)
      .then(() => {
        toast.success('Token publicShare successfully');
      })
      .finally(() => {
        open = false;
      });
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete public share</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete public share <strong>{publicShare.name}</strong>?
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={deleteShareLink}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>
