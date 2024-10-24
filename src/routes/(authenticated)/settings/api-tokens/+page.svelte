<script lang="ts">
  import { tokensApi } from '$lib/api';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { elapsedToString } from '$lib/utils/time';
  import { escapeHtml } from '$lib/utils/encoding';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  const modalStore = getModalStore();

  const toastStore = getToastStore();
  let tokens: TokenResponse[] = $state([]);

  function refreshTokens() {
    tokensApi
      .tokensListTokens()
      .then((response) => {
        tokens = response;
      })
      .catch((e) => {
        handleApiError(e, toastStore);
      });
  }

  function deleteToken(tokenId: string) {
    tokensApi
      .tokensDeleteToken(tokenId)
      .then(() => {
        tokens = tokens.filter((t) => t.id !== tokenId);
      })
      .catch((e) => {
        handleApiError(e, toastStore);
      });
  }

  function showDeleteTokenModal(token: TokenResponse) {
    modalStore.trigger({
      type: 'confirm',
      title: 'Please Confirm',
      body: `Are you sure you want to delete <b>${escapeHtml(token.name)}</b>?`,
      response: async (r: boolean) => {
        if (r) deleteToken(token.id);
      },
    });
  }

  function showGenerateTokenModal() {
    modalStore.trigger({
      type: 'component',
      // Data
      component: 'ApiTokenGenerate',
      response: refreshTokens,
    });
  }

  function showEditTokenModal(tokenId: string) {
    modalStore.trigger({
      type: 'component',
      // Data
      component: 'ApiTokenEdit',
      meta: { id: tokenId },
      response: refreshTokens,
    });
  }

  onMount(refreshTokens);

  let since: number = $state(Date.now());
  setInterval(() => {
    since = Date.now();
  }, 1000);
</script>

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
                  onclick={() => showEditTokenModal(token.id)}
                  aria-label="Edit Token"
                >
                </button>
                <button
                  class="btn-icon variant-filled-primary fa fa-trash"
                  onclick={() => showDeleteTokenModal(token)}
                  aria-label="Delete Token"
                >
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <button class="btn variant-filled-primary" onclick={showGenerateTokenModal}
      >Generate Token</button
    >
  </div>
</div>
