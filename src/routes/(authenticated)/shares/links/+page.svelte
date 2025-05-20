<script lang="ts">
  import { shockerShareLinksApi } from '$lib/api';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { onMount } from 'svelte';
  import { columns, type ShareLink } from './columns';
  import DataTable from './data-table.svelte';

  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

  let data = $state<ShareLink[]>([]);

  function refreshShareLinks() {
    shockerShareLinksApi
      .shareLinksList()
      .then((shareLinks) => {
        if (shareLinks.data === null || shareLinks.data === undefined) {
          console.warn('Failed to get share links, but response was success!');
          return;
        }
        data = shareLinks.data.map((shareLink) => {
          return {
            id: shareLink.id,
            name: shareLink.name,
            created_at: shareLink.createdOn,
            expires_at: shareLink.expiresOn,
          };
        });
      })
      .catch((error) => {
        console.error(error); // TODO: Show toast
      });
  }

  onMount(refreshShareLinks);
</script>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      ShareLinks
      <Button class="text-xl" onclick={refreshShareLinks}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
    <Card.Description>This is a list of all the sharelinks you control.</Card.Description>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} />
  </Card.Content>
</div>
