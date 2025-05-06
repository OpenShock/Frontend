<script lang="ts">
  import { shockerSharesV2Api } from '$lib/api';
  import * as Table from '$lib/components/ui/table/index.js';
  import { onMount } from 'svelte';
  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { Zap } from '@lucide/svelte';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import * as Collapsible from '$lib/components/ui/collapsible';

  let userShares = $state<Array<V2UserSharesListItem>>([]);

  function refreshUserShares() {
    shockerSharesV2Api
      .sharesGetSharesByUsers()
      .then((response) => {
        userShares = response;
      })
      .catch((error) => {
        console.error(error); // TODO: Show toast
      });
  }

  onMount(refreshUserShares);
</script>

<div class="container max-h-[50vh] overflow-y-auto rounded-md border p-0">
  <Table.Root>
    <Table.Body>
      {#each userShares as userShare (userShare.id)}
        <Table.Row>
          <Table.Cell class="flex items-center font-medium">
            <Avatar.Root class="h-15 w-15">
              <Avatar.Image src={userShare.image} alt="User Avatar" />
              <Avatar.Fallback delayMs={600}>
                {userShare.name.charAt(0)}
              </Avatar.Fallback>
            </Avatar.Root>
            <p class="ml-4">{userShare.name}</p>
          </Table.Cell>
          <Table.Cell>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <span
                  class="bg-sidebar flex items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800"
                >
                  <Zap size="15" />
                  <p class="ml-2">{userShare.shares.length}</p>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Shared shockers</p>
              </Tooltip.Content>
            </Tooltip.Root>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
