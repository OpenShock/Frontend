<script lang="ts">
  import { tokensApi } from '$lib/api';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { elapsedToString } from '$lib/utils/time';
  import { onMount } from 'svelte';
  import TokenEditDialog from './token-edit-dialog.svelte';
  import TokenDeleteDialog from './token-delete-dialog.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import TokenGenerateDialog from './token-generate-dialog.svelte';

  let tokens: TokenResponse[] = $state([]);
  let showGenerateTokenModal = $state<boolean>(false);
  let tokenToEdit = $state<TokenResponse | null>(null);
  let tokenToDelete = $state<TokenResponse | null>(null);

  function refreshToken(id: string) {
    tokensApi
      .tokensGetTokenById(id)
      .then((response) => {
        const index = tokens.findIndex((t) => t.id === id);
        if (index >= 0) {
          tokens[index] = response;
        } else {
          tokens.push(response);
        }
      })
      .catch(handleApiError);
  }
  function refreshTokens() {
    tokensApi
      .tokensListTokens()
      .then((response) => {
        tokens = response;
      })
      .catch(handleApiError);
  }

  onMount(refreshTokens);

  let since: number = $state(Date.now());
  setInterval(() => {
    since = Date.now();
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
  onDeleted={(id) => (tokens = tokens.filter((t) => t.id !== id))}
  onClose={() => (tokenToDelete = null)}
/>

<div class="container h-full mx-auto p-12 flex flex-col justify-start items-start gap-4">
  <h1 class="h1">API Tokens</h1>
  <div
    class="w-full flex flex-col items-start gap-y-4 p-4 bg-surface-100-800-token rounded-lg border border-gray-500"
  >
    <p>API Tokens are used to authenticate with the OpenShock API</p>

    <!-- Responsive Container (recommended) -->
    <div class="table-container">
      <!-- Native Table Element -->
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Last Used</th>
            <th class="w-0"></th>
          </tr>
        </thead>
        <tbody>
          {#each tokens as token (token.id)}
            <tr>
              <td>{token.name}</td>
              <td title={token.createdOn.toLocaleString()}
                >{token.createdOn.toLocaleDateString()}</td
              >
              {#if token.validUntil}
                <td title={token.validUntil.toLocaleString()}>
                  {elapsedToString(token.validUntil.getTime() - since)}
                </td>
              {:else}
                <td class="text-warning-500">Never</td>
              {/if}
              {#if token.lastUsed.getTime() < 0}
                <td>Never</td>
              {:else}
                <td title={token.lastUsed.toLocaleString()}>
                  {elapsedToString(token.lastUsed.getTime() - since)}
                </td>
              {/if}
              <td class="!whitespace-nowrap">
                <button
                  class="btn-icon variant-filled-primary fa fa-edit"
                  onclick={() => (tokenToEdit = token)}
                  aria-label="Edit Token"
                >
                </button>
                <button
                  class="btn-icon variant-filled-primary fa fa-trash"
                  onclick={() => (tokenToDelete = token)}
                  aria-label="Delete Token"
                >
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <Button onclick={() => (showGenerateTokenModal = true)}>Generate Token</Button>
  </div>
</div>
