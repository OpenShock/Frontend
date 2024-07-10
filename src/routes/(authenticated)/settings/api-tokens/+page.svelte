<script lang="ts">
  import { tokensApi } from '$lib/api';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { escapeHtml } from '$lib/utils/encoding';
  import { timeSince } from '$lib/utils/time';

  const modalStore = getModalStore();

  let tokens: TokenResponse[] = [];

  let since: number = Date.now();
  setInterval(() => {
    since = Date.now();
  }, 1000);

  async function refreshTokens() {
    const response = await tokensApi.tokensListTokens();
    if (!response.data) {
      // FIXME: Handle error
      console.error(response);
      return;
    }

    tokens = response.data;
  }

  function deleteToken(token: TokenResponse) {
    modalStore.trigger({
      type: 'confirm',
      // Data
      title: 'Please Confirm',
      body: `Are you sure you want to delete <b>${escapeHtml(token.name)}</b>?`,
      response: async (r: boolean) => {
        if (r) await deleteTokenActually(token.id);
      },
    });
  }

  async function deleteTokenActually(id: string) {
    try {
      const response = await tokensApi.tokensDeleteToken(id);

      tokens = tokens.filter((token) => token.id !== id);
    } catch (e) {
      // FIXME: Handle error
      console.error(e);
    }
  }

  function generateToken() {
    modalStore.trigger({
      type: 'component',
      // Data
      component: 'ApiTokenGenerate',
      response: async (r: boolean) => {
        await refreshTokens();
      },
    });
  }

  function editToken(tokenId: string) {
    modalStore.trigger({
      type: 'component',
      // Data
      component: 'ApiTokenEdit',
      meta: { id: tokenId },
      response: async (r: boolean) => {
        await refreshTokens();
      },
    });
  }

  refreshTokens();
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
          {#each tokens as row (row.id)}
            <tr>
              <td>{row.name}</td>
              <td title={row.createdOn.toLocaleString()}>{row.createdOn.toLocaleDateString()}</td>
              {#if row.validUntil}
                <td title={row.validUntil.toLocaleString()}>In {timeSince(row.validUntil.getTime() - since)}</td>
              {:else}
                <td class="text-amber-500">Never</td>
              {/if}
              <td>LastUsed</td>
              <td class="!whitespace-nowrap">
                <button class="btn-icon variant-filled-primary fa fa-edit"
                on:click={() => editToken(row.id)}></button>
                <button
                  class="btn-icon variant-filled-primary fa fa-trash"
                  on:click={() => deleteToken(row)}
                ></button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <button class="btn variant-filled-primary" on:click={generateToken}>Generate Token</button>
  </div>
</div>
