<script lang="ts">
  import { shareLinksDeletePublicShare } from '$lib/api';
  import type { OwnPublicShareResponse } from '$lib/api';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    publicShare: OwnPublicShareResponse;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), publicShare, onDeleted }: Props = $props();

  function deleteShareLink() {
    shareLinksDeletePublicShare({ path: { publicShareId: publicShare.id } })
      .then(() => {
        onDeleted();
        toast.success('Deleted publicShare successfully');
      })
      .catch(handleApiError)
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
