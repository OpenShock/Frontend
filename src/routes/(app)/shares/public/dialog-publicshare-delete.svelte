<script lang="ts">
  import { publicShockerSharesApi } from '$lib/api';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import ConfirmDeleteDialog from '$lib/components/ConfirmDeleteDialog.svelte';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    publicShare: OwnPublicShareResponse;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), publicShare, onDeleted }: Props = $props();

  function deleteShareLink() {
    publicShockerSharesApi
      .shareLinksDeletePublicShare(publicShare.id)
      .then(() => {
        onDeleted();
        toast.success('Deleted publicShare successfully');
      })
      .finally(() => {
        open = false;
      });
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete public share" onConfirm={deleteShareLink}>
  {#snippet description()}
    Are you sure you want to delete public share <strong>{publicShare.name}</strong>?
  {/snippet}
</ConfirmDeleteDialog>
