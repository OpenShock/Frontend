<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import Container from '$lib/components/Container.svelte';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { ApiTokensStore, refreshApiTokens } from '$lib/stores/ApiTokensStore';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { columns } from './columns';
  import TokenGenerateDialog from './dialog-token-generate.svelte';

  let data = $derived($ApiTokensStore.values().toArray());
  let sorting = $state<SortingState>([]);

  let showGenerateTokenModal = $state<boolean>(false);

  onMount(refreshApiTokens);
</script>

<TokenGenerateDialog bind:open={showGenerateTokenModal} />

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      API Tokens
      <div>
        <Button onclick={() => (showGenerateTokenModal = true)}>
          <Plus />
          Generate Token
        </Button>
        <Button
          onclick={() => {
            refreshApiTokens();
            toast.success('Tokens refreshed successfully');
          }}
        >
          <RotateCcw />
          Refresh
        </Button>
      </div>
    </Card.Title>
    <Card.Description>API Tokens are used to authenticate with the OpenShock API</Card.Description>
  </Card.Header>
  <Card.Content class="flex flex-col space-y-4 w-full">
    <DataTable {data} {columns} {sorting} />
    <div class="flex justify-end"></div>
  </Card.Content>
</Container>
