<script lang="ts">
  import { adminDeleteAutomationToken } from '#lib/api/index.js';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';
  import type { AutomationToken } from './columns';

  interface Props {
    open: boolean;
    token: AutomationToken;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), token, onDeleted }: Props = $props();

  function onDeleteClicked() {
    return adminDeleteAutomationToken({ path: { id: token.id } })
      .then(() => {
        onDeleted();
        toast.success('Deleted automation token');
      })
      .catch(handleApiError);
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete automation token" onConfirm={onDeleteClicked}>
  {#snippet description()}
    Deleting <strong>{token.name}</strong> also deletes <strong>every account it created</strong>,
    along with their hubs, shockers and logs.<br />
    The API refuses the delete while any of those accounts holds a privileged role.<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>
