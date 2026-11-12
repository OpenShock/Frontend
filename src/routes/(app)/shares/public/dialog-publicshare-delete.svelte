<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
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

  async function deleteShareLink() {
    try {
      await shareLinksDeletePublicShare({ path: { publicShareId: publicShare.id } });
      toast.success(m.public_share_toast_deleted());
      onDeleted();
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<ConfirmDeleteDialog bind:open title={m.public_share_delete_title()} onConfirm={deleteShareLink}>
  {#snippet description()}
    <ParaglideMessage message={m.public_share_delete_desc} inputs={{ name: publicShare.name }}>
      {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
    </ParaglideMessage>
  {/snippet}
</ConfirmDeleteDialog>
