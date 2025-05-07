<script lang="ts">
  import { shockerSharesV2Api } from '$lib/api';
  import * as Table from '$lib/components/ui/table/index.js';
  import { onMount } from 'svelte';

  import type { V2UserSharesListItem } from '$lib/api/internal/v2';
  import UserShareDrawer from './UserShareDrawer.svelte';



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
        <UserShareDrawer userShare={userShare} />
      {/each}
    </Table.Body>
  </Table.Root>
</div>