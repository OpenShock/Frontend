<script lang="ts">
  import { publicGetPublicShare } from '$lib/api';
  import type { PublicShareResponse } from '$lib/api';
  import { CircleUser, LogIn, Undo2 } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { Button } from '$hadcn/button';
  import * as Card from '$hadcn/card';
  import Input from '$hadcn/input/input.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import { onMount } from 'svelte';
  import ControlView from './ControlView.svelte';

  // Page is reactive and query parameters can change
  let loginUrl = $derived(
    resolve(`/login?redirect=${encodeURIComponent(page.url.pathname + page.url.search)}`)
  );

  let details = $state<Promise<PublicShareResponse>>(getShareDetails());
  let shareData = $state<PublicShareResponse | null>(null);
  let enterAsGuestClicked = $state(false);
  let guestName = $state<string | null>(null);
  let entered = $state(false);

  registerBreadcrumbs(() => [
    { label: 'Public Shares', href: '/shares/public' },
    { label: shareData?.name ?? 'Public Share' },
  ]);

  // Fetch share details
  async function getShareDetails(): Promise<PublicShareResponse> {
    const publicShareId = page.params.shareId;
    if (!publicShareId) {
      throw new Error('Share ID is missing from the URL parameters.');
    }

    try {
      const response = (await publicGetPublicShare({ path: { publicShareId } })).data;
      shareData = response;
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  onMount(async () => {
    await details;

    if (userState.self) {
      entered = true;
    }
  });
</script>

{#await details}
  <p>Loading share details...</p>
{:then shareLinkRoot}
  {#if entered}
    <ControlView {shareLinkRoot} {guestName} />
  {:else}
    <div class="flex h-full w-full items-center justify-center">
      <Card.Root class="w-[400px]">
        <Card.Header class="text-center">
          <Card.Title class="text-xl">Public Share Link</Card.Title>
          <Card.Description>Enter as a guest or login with your OpenShock account</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col gap-2">
          {#if enterAsGuestClicked}
            <Input placeholder="Guest Name" bind:value={guestName}></Input>
            <span class="flex gap-2">
              <Button class="grow" variant="outline" onclick={() => (enterAsGuestClicked = false)}
                ><Undo2 /> Back</Button
              >
              <Button
                class="grow"
                variant="outline"
                disabled={guestName ? false : true}
                onclick={() => (entered = true)}><LogIn /> Enter</Button
              >
            </span>
          {:else}
            <Button variant="outline" onclick={() => (enterAsGuestClicked = true)}
              ><CircleUser /> Enter as Guest</Button
            >
            <Button variant="outline" href={loginUrl}><LogIn /> Login</Button>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  {/if}
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
