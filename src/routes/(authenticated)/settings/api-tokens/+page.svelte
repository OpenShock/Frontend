<script lang="ts">
  import type { TokenResponse } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { onMount } from 'svelte';
  import { columns, type ApiToken } from './columns';
  import DataTable from './data-table.svelte';
  import TokenGenerateDialog from './dialog-token-generate.svelte';

  import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
  import { refreshApiToken, refreshApiTokens } from '$lib/stores/ApiTokensStore';

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

  let data = $state<ApiToken[]>([]);
  let showGenerateTokenModal = $state<boolean>(false);

  onMount(refreshApiTokens);

  setInterval(() => {
    data = Object.assign([], data); // Force update
  }, 1000);
</script>

<TokenGenerateDialog
  open={showGenerateTokenModal}
  onGenerated={(id) => refreshApiToken(id)}
  onClose={() => (showGenerateTokenModal = false)}
/>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="text-3xl flex items-center space-x-2 justify-between">
      API Tokens
      <Button class="btn variant-filled-primary" onclick={refreshApiTokens}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
    <Card.Description>API Tokens are used to authenticate with the OpenShock API</Card.Description>
  </Card.Header>
  <Card.Content class="flex flex-col space-y-4">
    <DataTable {data} {columns} />
    <div class="flex justify-end">
      <Button onclick={() => (showGenerateTokenModal = true)}>Generate Token</Button>
    </div>
  </Card.Content>
</div>