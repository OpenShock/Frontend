<script lang="ts">
  import { Zap } from '@lucide/svelte';
  import PermissionTooltip from '$lib/components/shares/permission-tooltip.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import * as Table from '$lib/components/ui/table';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import MultiPauseToggle from '$lib/components/utils/MultiPauseToggle.svelte';
  import { UserShares } from '$lib/stores/UserSharesStore';
  import { ShockerPause } from '$lib/utils';
  import { derived } from 'svelte/store';

  interface Props {
    storeIndex: number;
    onOpenEdit: () => void;
  }

  let { storeIndex, onOpenEdit }: Props = $props();
  let userShare = derived(UserShares, ($a) => $a.outgoing[storeIndex]);
</script>

<Table.Row onclick={onOpenEdit}>
  <Table.Cell class="flex items-center font-medium">
    <Avatar.Root class="h-15 w-15">
      <Avatar.Image src={$userShare.image} alt="User Avatar" />
      <Avatar.Fallback>
        {$userShare.name.charAt(0)}
      </Avatar.Fallback>
    </Avatar.Root>
    <p class="ml-4">{$userShare.name}</p>
  </Table.Cell>
  <Table.Cell>
    <span
      class="bg-sidebar flex items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800 w-max"
    >
      <Zap size="15" />
      <p class="ml-2 inline-block sm:hidden">{$userShare.shares.length}</p>
      <div class="hidden sm:inline-block">
        {#each $userShare.shares as share}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Badge class="ml-2" variant={share.paused !== 0 ? 'destructive' : 'default'}
                >{share.name}</Badge
              >
            </Tooltip.Trigger>
            <Tooltip.Content>
              <PermissionTooltip permAndLimits={share} />
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </div>
    </span>
  </Table.Cell>
  <Table.Cell>
    <MultiPauseToggle
      shockers={$userShare.shares.map((share) => ({
        shockerId: share.id,
        paused: (share.paused & ShockerPause.SHARE) !== 0,
        userShareUserId: $userShare.id,
      }))}
      onPausedChange={(paused) => {
        UserShares.update((current) => {
          current.outgoing[storeIndex].shares.forEach(
            (share) => (share.paused = paused ? share.paused | 2 : share.paused & ~2)
          );
          return current;
        });
      }}
    />
  </Table.Cell>
</Table.Row>
