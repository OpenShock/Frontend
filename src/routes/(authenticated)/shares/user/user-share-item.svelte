<script lang="ts">
  import type {
    V2UserSharesListItem,
  } from '$lib/api/internal/v2';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import * as Table from '$lib/components/ui/table';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import MultiPauseToggle from '$lib/components/utils/MultiPauseToggle.svelte';
  import { Zap } from '@lucide/svelte';

  interface Props {
    userShare: V2UserSharesListItem;
    onOpenEdit: () => void;
  }

  let { userShare = $bindable(), onOpenEdit }: Props = $props();

</script>

<Table.Row onclick={onOpenEdit}>
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
  <Table.Cell>
    <MultiPauseToggle
      shockers={userShare.shares.map((share) => ({
        shockerId: share.id,
        paused: share.paused,
        userShareUserId: userShare.id,
      }))}
      onPausedChange={(paused) => {
        userShare.shares.forEach((share) => (share.paused = paused));
      }}
    />
  </Table.Cell>
</Table.Row>