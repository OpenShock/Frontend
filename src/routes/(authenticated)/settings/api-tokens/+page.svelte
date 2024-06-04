<script lang="ts">
</script>

<div class="container h-full mx-auto p-12 flex flex-col justify-start items-start gap-4">
  <h1 class="h1">API Tokens</h1>
  <div
    class="w-full flex flex-col items-start gap-y-4 p-4 bg-surface-100-800-token rounded-lg border border-blue-600"
  >
    <p>API Tokens are used to authenticate with the OpenShock API</p>
    <ul class="flex flex-col gap-y-2">
      {#each ['token1', 'token2', 'token3'] as token}
        <li
          class="flex items-center justify-between w-full p-2 bg-surface-200-700-token rounded-lg"
        >
          <span>{token}</span>
          <button class="btn-icon">
            <i class="fa fa-trash" />
          </button>
        </li>
      {/each}
    </ul>
    <button class="btn variant-filled-primary">Generate Token</button>
  </div>
</div>
