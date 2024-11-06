<script lang="ts">
  import { tokensApi } from '$lib/api';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import TokenEditDialog from './token-edit-dialog.svelte';
  import TokenDeleteDialog from './token-delete-dialog.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import TokenGenerateDialog from './token-generate-dialog.svelte';
  import * as Card from '$lib/components/ui/card';
  import DataTable from './data-table.svelte';
  import { columns, type ApiToken } from './columns';

  function apiTokenToTableToken(user: TokenResponse): ApiToken {
    return {
      id: user.id,
      name: user.name ?? 'Unknown',
      created_at: user.createdOn,
      expires_at: user.validUntil,
      last_used: user.lastUsed,
      permissions: user.permissions ?? [],
    };
  }

  let data = $state<ApiToken[]>([]);
  let showGenerateTokenModal = $state<boolean>(false);
  let tokenToEdit = $state<ApiToken | null>(null);
  let tokenToDelete = $state<ApiToken | null>(null);

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
<TokenEditDialog
  token={tokenToEdit}
  onEdited={(id) => refreshToken(id)}
  onClose={() => (tokenToEdit = null)}
/>
<TokenDeleteDialog
  token={tokenToDelete}
  onDeleted={(id) => (data = data.filter((t) => t.id !== id))}
  onClose={() => (tokenToDelete = null)}
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
