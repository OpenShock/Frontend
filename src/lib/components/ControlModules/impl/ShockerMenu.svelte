<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { shockerRemoveShocker } from '#lib/api/index.js';
  import type { ShockerResponse } from '#lib/api/index.js';
  import { Copy, Ellipsis, Logs, Pencil, Share2, Trash2 } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { refreshOwnHubs } from '#lib/state/hubs-state.svelte.js';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { resolve } from '$app/paths';
  import { toast } from 'svelte-sonner';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  function copyId() {
    copyToClipboard(shocker.id, m.common_id_copied());
  }

  function viewLogs() {
    goto(resolve(`shockers/logs?shockerId=${shocker.id}`));
  }

  function editShocker() {
    goto(resolve(`shockers/${shocker.id}/edit`));
  }

  function shareShocker() {
    goto(resolve(`shares/user/outgoing?share=${shocker.id}`));
  }

  async function deleteShocker() {
    const result = await dialog.confirm({
      title: m.shocker_delete_title(),
      desc: m.shocker_delete_desc({ name: shocker.name }),
      confirmButtonText: m.common_delete(),
    });
    if (!result.confirmed) return;
    try {
      await shockerRemoveShocker({ path: { shockerId: shocker.id } });
      toast.success(m.shocker_toast_deleted({ name: shocker.name }));
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    }
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">{m.common_open_menu()}</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Label>{m.shocker_label()}</DropdownMenu.Label>
    <DropdownMenu.Group>
      <DropdownMenu.Item class="cursor-pointer" onclick={editShocker}
        ><Pencil class="size-4" />{m.common_edit()}</DropdownMenu.Item
      >
      <DropdownMenu.Item class="cursor-pointer" onclick={shareShocker}
        ><Share2 class="size-4" />{m.common_share()}</DropdownMenu.Item
      >
      <DropdownMenu.Item class="cursor-pointer" onclick={viewLogs}
        ><Logs class="size-4" />{m.shocker_menu_view_logs()}</DropdownMenu.Item
      >
      <DropdownMenu.Separator />
      <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
        <Copy class="size-4" />
        {m.common_copy_id()}
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item class="text-destructive cursor-pointer" onclick={deleteShocker}>
        <Trash2 class="size-4" />
        {m.common_delete()}
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
