<script lang="ts">
  import { UserSelfStore } from '$lib/stores/UserStore';
</script>

{#if !$UserSelfStore}
  <div class="container h-full mx-auto flex justify-center items-center">
    <h1 class="text-4xl">You need to be logged in to access this page</h1>
    <a href="/login" class="btn variant-filled-primary">Login</a>
  </div>
{:else}
  <slot />
{/if}
