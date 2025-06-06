<script lang="ts">
  import Zap from '@lucide/svelte/icons/zap';
  import type { V2UserSharesListItem } from '$lib/api/internal/v2';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import * as Drawer from '$lib/components/ui/drawer';
  import * as Table from '$lib/components/ui/table';
  import * as Tooltip from '$lib/components/ui/tooltip';

  type UserShareDrawerProps = {
    userShare: V2UserSharesListItem;
  };

  let editDrawer = $state(false);

  let { userShare }: UserShareDrawerProps = $props();
</script>

<Drawer.Root open={editDrawer} onOpenChange={(newState) => (editDrawer = newState)}>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Edit shares with <b>{userShare.name}</b></Drawer.Title>
      <Drawer.Description>This action cannot be undone.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Footer>
      <Drawer.Close>Cancel</Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>

<Table.Row onclick={() => (editDrawer = true)}>
  <Table.Cell class="flex items-center font-medium">
    <Avatar.Root class="h-15 w-15">
      <Avatar.Image src={userShare.image} alt="User Avatar" />
      <Avatar.Fallback>
        {userShare.name.charAt(0)}
      </Avatar.Fallback>
    </Avatar.Root>
    <p class="ml-4">{userShare.name}</p>
  </Table.Cell>
  <Table.Cell>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <span class="bg-sidebar flex items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800">
          <Zap size="15" />
          <p class="ml-2 inline-block sm:hidden">{userShare.shares.length}</p>
          <div class="hidden sm:inline-block">
            {#each userShare.shares as share}
              <Badge class="ml-2">{share.name}</Badge>
            {/each}
          </div>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Shared shockers</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
</Table.Row>
