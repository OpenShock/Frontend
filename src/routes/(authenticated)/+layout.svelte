<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { SignalR_State } from '$lib/signalr';
  import { UserStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

{#if $UserStore.self === null}
  <div class="container mx-auto flex h-full flex-col items-center justify-center gap-4">
    <h1 class="text-4xl">You need to be logged in to access this page</h1>
    <Button href="/login">Login</Button>
  </div>
{:else if $SignalR_State !== HubConnectionState.Connected}
  <div class="container mx-auto flex h-full items-center justify-center">
    <h1 class="text-4xl">Connecting to server...</h1>
  </div>
{:else}
  {@render children?.()}
{/if}
