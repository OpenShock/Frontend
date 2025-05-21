<script lang="ts">
  import { shockerSharesV2Api } from '$lib/api';
  import * as Table from '$lib/components/ui/table/index.js';
  import { onMount } from 'svelte';

  import type { V2UserShares } from '$lib/api/internal/v2';
  import UserShareDrawer from './UserShareDrawer.svelte';

  let userShares = $state<V2UserShares>({ outgoing: [], incoming: [] });

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

<div class="overflow-y-auto rounded-md border p-0">
  <Table.Root>
    <Table.Body>
      {#each userShares.outgoing as userShare (userShare.id)}
        <UserShareDrawer {userShare} />
      {/each}
    </Table.Body>
  </Table.Root>
</div>
