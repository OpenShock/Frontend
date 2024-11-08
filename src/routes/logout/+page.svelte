<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { accountV1Api, usersApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { UserStore } from '$lib/stores/UserStore';
  import { onMount } from 'svelte';

  async function logout() {
    try {
      await accountV1Api.accountLogout();
    } catch (e) {
      handleApiError(e);
    }

    UserStore.reset();

    goto('/');
  }

  onMount(() => {
    // If we can't get the user, we are already logged out, make sure to clear the cookies and store
    usersApi.usersGetSelf().catch(logout);
  });
</script>

{#if browser && $UserStore.self}
  <div class="container h-full mx-auto flex justify-center items-center">
    <div class="flex flex-col space-y-4">
      <h2 class="h2">Logout</h2>

      <p>Are you sure you want to logout?</p>

      <button class="btn variant-filled-primary" onclick={logout}> Logout </button>
    </div>
  </div>
{/if}
