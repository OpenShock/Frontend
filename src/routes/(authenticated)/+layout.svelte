<script lang="ts">
  import { signalr_state } from '$lib/signalr/connection';
  import { UserStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
</script>

{#if $UserStore.self === null}
  <div class="container h-full mx-auto flex justify-center items-center">
    <h1 class="text-4xl">You need to be logged in to access this page</h1>
    <a href="/login" class="btn variant-filled-primary">Login</a>
  </div>
{:else if $signalr_state !== HubConnectionState.Connected}
  <div class="container h-full mx-auto flex justify-center items-center">
    <h1 class="text-4xl">Connecting to server...</h1>
  </div>
{:else}
  <slot />
{/if}
