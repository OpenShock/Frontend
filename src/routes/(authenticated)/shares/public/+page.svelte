<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import { publicShockerSharesApi } from '$lib/api';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { onMount } from 'svelte';
  import { columns } from './columns';

  let data = $state<OwnPublicShareResponse[]>([]);
  let sorting = $state<SortingState>([]);

  function refreshPublicShares() {
    publicShockerSharesApi
      .shareLinksList()
      .then((publicShares) => {
        if (publicShares.data === null || publicShares.data === undefined) {
          console.warn('Failed to get share links, but response was success!');
          return;
        }
        data = publicShares.data;
      })
      .catch((error) => {
        console.error(error); // TODO: Show toast
      });
  }

  onMount(refreshPublicShares);
</script>

<Container>
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Public Shares
      <Button class="text-xl" onclick={refreshPublicShares}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
    <Card.Description>This is a list of all the public shares you control.</Card.Description>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} {sorting} />
  </Card.Content>
</Container>
