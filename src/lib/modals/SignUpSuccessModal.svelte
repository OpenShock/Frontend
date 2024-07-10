<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let parent: SvelteComponent;
</script>

<div class="bg-surface-100-800-token w-screen h-screen p-4 flex justify-center items-center">
  <div class="flex flex-col items-center space-y-4">
    <h2 class="h2">Account created</h2>
    <p>Your account has been created. Please check your email to verify your account.</p>
    <button
      class="btn variant-filled-primary"
      on:click={() => {
        parent.onClose();
      }}
    >
      Ok
    </button>
  </div>
</div>
