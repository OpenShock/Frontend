<script lang="ts">
  import { adminConfigurationDelete } from '$lib/api';
  import type { ConfigurationItemDto } from '$lib/api';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    item: ConfigurationItemDto;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), item, onDeleted }: Props = $props();

  function onSubmit() {
    adminConfigurationDelete({ path: { name: item.name } })
      .then(() => {
        onDeleted();
        toast.success('Removed item');
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete configuration item" onConfirm={onSubmit}>
  {#snippet description()}
    Are you sure you want to delete <strong>{item.name}</strong>?<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>
