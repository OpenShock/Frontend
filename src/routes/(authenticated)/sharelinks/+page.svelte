<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { columns, type ShareLink } from './columns';
  import DataTable from './data-table.svelte';

  import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
  import { refreshShareLinks, ShareLinksStore } from '$lib/stores/ShareLinkStore';

  let data = $derived.by<ShareLink[]>(() => {
    if (!$ShareLinksStore) return [];
    return Array.from($ShareLinksStore).map(([, hub]) => {
      return {
        id: hub.id,
        name: hub.name,
        created_at: hub.createdOn,
        expires_at: hub.expiresOn,
      };
    });
  });
</script>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      ShareLinks
      <Button class="btn variant-filled-primary text-xl" onclick={refreshShareLinks}>
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
