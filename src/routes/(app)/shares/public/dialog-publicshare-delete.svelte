<script lang="ts">
  import { shareLinksDeletePublicShare } from '#lib/api/index.js';
  import type { OwnPublicShareResponse } from '#lib/api/index.js';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    publicShare: OwnPublicShareResponse;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), publicShare, onDeleted }: Props = $props();

  function deleteShareLink() {
    return shareLinksDeletePublicShare({ path: { publicShareId: publicShare.id } })
      .then(() => {
        onDeleted();
        toast.success('Deleted publicShare successfully');
      })
      .catch(async (error) => {
        await handleApiError(error);
        throw error;
      });
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete public share" onConfirm={deleteShareLink}>
  {#snippet description()}
    Are you sure you want to delete public share <strong>{publicShare.name}</strong>?
  {/snippet}
</ConfirmDeleteDialog>
