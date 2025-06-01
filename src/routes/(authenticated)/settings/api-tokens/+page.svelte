<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { ApiTokensStore, refreshApiToken, refreshApiTokens } from '$lib/stores/ApiTokensStore';
  import { onMount } from 'svelte';
  import { type ApiToken, columns } from './columns';
  import TokenGenerateDialog from './dialog-token-generate.svelte';

  function apiTokenToTableToken(user: TokenResponse): ApiToken {
    return {
      id: user.id,
      name: user.name,
      created_at: user.createdOn,
      expires_at: user.validUntil,
      last_used: user.lastUsed,
      permissions: user.permissions,
    };
  }

  let data = $derived<ApiToken[]>(
    Array.from($ApiTokensStore).map(([_, token]) => apiTokenToTableToken(token))
  );
  let sorting = $state<SortingState>([]);

  let showGenerateTokenModal = $state<boolean>(false);

  onMount(refreshApiTokens);
</script>

<TokenGenerateDialog bind:open={showGenerateTokenModal} onGenerated={(id) => refreshApiToken(id)} />

<div class="container my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      API Tokens
      <div>
        <Button onclick={() => (showGenerateTokenModal = true)}>
          <RotateCcw />
          <span> Generate Token </span>
        </Button>
        <Button onclick={refreshApiTokens}>
          <RotateCcw />
          Refresh
        </Button>
      </div>
    </Card.Title>
    <Card.Description>API Tokens are used to authenticate with the OpenShock API</Card.Description>
  </Card.Header>
  <Card.Content class="flex flex-col space-y-4">
    <DataTable {data} {columns} {sorting} />
    <div class="flex justify-end"></div>
  </Card.Content>
</div>
