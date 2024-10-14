<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';

  export let parent: SvelteComponent;
  const modalStore = getModalStore();

  let token: string = 'error';

  function copyToken() {
    navigator.clipboard.writeText(token);
    //TODO: Show a toast message
  }

token = $modalStore[0].meta.token;
</script>

<div class="card py-6 px-10 w-modal shadow-xl space-y-4 text-center">
  <header class="text-2xl font-bold">API Token Generated</header>
  <p>Please copy your API Token now, you will not be able to view it again later!</p>
  <div class="flex flex-col items-center space-y-4">

    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim fa fa-key"></div>
        <input readonly type="text" value={token} />
        <button on:click={copyToken} class="variant-filled-secondary fa fa-copy" style="outline-style: none;" aria-label="Copy Token"></button>
    </div>

    <button
      class="btn variant-filled-primary"
      on:click={() => {
        parent.onClose();
      }}
    >
      I copied it
    </button>
  </div>
</div>
