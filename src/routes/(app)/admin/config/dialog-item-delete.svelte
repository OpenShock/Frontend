<script lang="ts">
  import { adminConfigurationDelete } from '#lib/api/index.js';
  import type { ConfigurationItemDto } from '#lib/api/index.js';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    item: ConfigurationItemDto;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), item, onDeleted }: Props = $props();

  async function onSubmit() {
    try {
      await adminConfigurationDelete({ path: { name: item.name } });
      toast.success('Removed item');
      onDeleted();
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete configuration item" onConfirm={onSubmit}>
  {#snippet description()}
    Are you sure you want to delete <strong>{item.name}</strong>?<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>
