<script lang="ts">
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  function logout() {
    // TODO: Make a API call to invalidate the cookie

    UserSelfStore.set(null);

    goto('/');
  }

  $: if (browser && !$UserSelfStore) {
    logout();
  }
</script>

{#if browser && $UserSelfStore}
  <div class="container h-full mx-auto flex justify-center items-center">
    <div class="flex flex-col space-y-4">
      <h2 class="h2">Logout</h2>

      <p>Are you sure you want to logout?</p>

      <button class="btn variant-filled-primary" on:click={logout}> Logout </button>
    </div>
  </div>
{/if}
