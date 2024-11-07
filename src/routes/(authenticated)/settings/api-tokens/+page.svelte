<script lang="ts">
  import { tokensApi } from '$lib/api';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import TokenGenerateDialog from './dialog-token-generate.svelte';
  import * as Card from '$lib/components/ui/card';
  import DataTable from './data-table.svelte';
  import { columns, type ApiToken } from './columns';

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

  function refreshToken(id: string) {
    tokensApi
      .tokensGetTokenById(id)
      .then((response) => {
        const index = data.findIndex((t) => t.id === id);
        if (index >= 0) {
          data[index] = apiTokenToTableToken(response);
          data = Object.assign([], data); // Force update
        } else {
          data = [...data, apiTokenToTableToken(response)];
        }
      })
      .catch(handleApiError);
  }
  function refreshTokens() {
    tokensApi
      .tokensListTokens()
      .then((response) => {
        data = response.map(apiTokenToTableToken);
      })
      .catch(handleApiError);
  }

  onMount(refreshTokens);

  setInterval(() => {
    data = Object.assign([], data); // Force update
  }, 1000);
</script>

<TokenGenerateDialog
  open={showGenerateTokenModal}
  onGenerated={(id) => refreshToken(id)}
  onClose={() => (showGenerateTokenModal = false)}
/>

<Card.Root>
  <Card.Header>
    <Card.Title>API Tokens</Card.Title>
    <Card.Description>API Tokens are used to authenticate with the OpenShock API</Card.Description>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} />
    <Button onclick={() => (showGenerateTokenModal = true)}>Generate Token</Button>
  </Card.Content>
</Card.Root>
