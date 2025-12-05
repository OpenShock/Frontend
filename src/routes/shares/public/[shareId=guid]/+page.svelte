<script lang="ts">
  import { page } from '$app/state';
  import { publicShockerSharesApi } from '$lib/api';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import * as Card from "$lib/components/ui/card/index.js";
  import { onMount } from 'svelte';
    import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
      import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';
  import PublicShareClassicControlModule from '$lib/components/ControlModules/PublicShareClassicControlModule.svelte';
  import { Button } from '$lib/components/ui/button';
  import { CircleUser, LogIn, Undo2 } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Input from '$lib/components/ui/input/input.svelte';
  import * as Form from "$lib/components/ui/form/index.js";
  import { UserStore } from '$lib/stores/UserStore';
  import ControlView from './ControlView.svelte';

  const loginUrl = resolve('/login') + '?redirect=' + encodeURIComponent(page.url.pathname + page.url.search);

  let details = $state<Promise<PublicShareResponse>>(getShareDetails());
  let enterAsGuestClicked = $state(false);
  let guestName = $state<string | null>(null);
  let entered = $state(false);

  // Fetch share details
  async function getShareDetails(): Promise<PublicShareResponse> {
    const shareId = page.params.shareId;
    if (!shareId) {
      throw new Error('Share ID is missing from the URL parameters.');
    }

    try {
      return (await publicShockerSharesApi.publicGetPublicShare(shareId)).data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
  
  onMount(async () => {
    
    await details;

    if($UserStore.self) {
      entered = true;
    }
  });

</script>

<div class="flex items-center justify-center w-full h-full">
  {#await details}
    <p>Loading share details...</p>
  {:then shareLinkRoot}
    {#if entered}
        <ControlView {shareLinkRoot} guestName={guestName} />
    {:else}
    <Card.Root class="w-[400px]">
        <Card.Header class="text-center">
            <Card.Title class="text-xl">Public Share Link</Card.Title>
            <Card.Description>Enter as a guest or login with your OpenShock account</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col gap-2">
            {#if enterAsGuestClicked}
                <Input placeholder="Guest Name" bind:value={guestName}></Input>
                <span class="flex gap-2">
                    <Button class="grow" variant="outline" onclick={() => enterAsGuestClicked = false}><Undo2 /> Back</Button>
                    <Button class="grow" variant="outline" disabled={guestName ? false : true} onclick={() => entered = true}><LogIn /> Enter</Button>
                </span>
            {:else}
                <Button variant="outline" onclick={() => enterAsGuestClicked = true}><CircleUser /> Enter as Guest</Button>
                <Button variant="outline" href={loginUrl}><LogIn /> Login</Button>
            {/if}
        </Card.Content>
    </Card.Root>
    {/if}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
