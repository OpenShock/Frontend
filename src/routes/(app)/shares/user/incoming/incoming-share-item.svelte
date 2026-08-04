<script lang="ts">
  import { X, Zap } from '@lucide/svelte';
  import type { V2UserSharesListItem } from '$lib/api';
  import PermissionTooltip from '$lib/components/shares/permission-tooltip.svelte';
  import * as Avatar from '@openshock/svelte-core/components/ui/avatar';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import * as Tooltip from '@openshock/svelte-core/components/ui/tooltip';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { refreshOutgoingInvites } from '$lib/state/user-shares-state.svelte';
  import { toast } from 'svelte-sonner';

  interface Props {
    share: V2UserSharesListItem;
    onOpenEdit: () => void;
  }

  let { share = $bindable(), onOpenEdit }: Props = $props();

  async function removeShareCall(value: V2UserSharesListItem) {
    try {
      toast.success(`Removed share for ${value.name}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshOutgoingInvites();
    }
  }

  async function removeShare() {
    const result = await dialog.confirm({
      title: 'Remove Share',
      confirmButtonText: 'Remove',
      data: share,
      descSnippet: confirmDesc,
    });
    if (result.confirmed) await removeShareCall(result.data);
  }
</script>

{#snippet confirmDesc(invite: V2UserSharesListItem)}
  <p>Are you sure you want to remove the share for <strong>{invite.name}</strong>?</p>
{/snippet}

<Table.Row onclick={onOpenEdit}>
  <Table.Cell class="flex items-center font-medium">
    <Avatar.Root class="h-15 w-15">
      <Avatar.Image src={share.image} alt="User Avatar" />
      <Avatar.Fallback>
        {share.name.charAt(0)}
      </Avatar.Fallback>
    </Avatar.Root>
    <p class="ml-4">{share.name}</p>
  </Table.Cell>
  <Table.Cell>
    <span
      class="bg-sidebar flex w-max items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800"
    >
      <Zap size="15" />
      <p class="ml-2 inline-block sm:hidden">{share.shares.length}</p>
      <div class="hidden sm:inline-block">
        {#each share.shares as shocker (shocker.id)}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Badge class="ml-2" variant={shocker.paused !== 0 ? 'destructive' : 'default'}
                >{shocker.name}</Badge
              >
            </Tooltip.Trigger>
            <Tooltip.Content>
              <PermissionTooltip permAndLimits={shocker} pauseState={shocker.paused} />
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </div>
    </span>
  </Table.Cell>
  <Table.Cell>
    <Button class="size-9" onclick={removeShare}>
      <X />
    </Button>
  </Table.Cell>
</Table.Row>
