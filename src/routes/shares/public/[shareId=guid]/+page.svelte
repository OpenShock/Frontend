<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { publicGetPublicShare } from '#lib/api/index.js';
  import type { PublicShareResponse } from '#lib/api/index.js';
  import { CircleUser, LogIn, Undo2 } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { userState } from '#lib/state/user-state.svelte.js';
  import { onMount } from 'svelte';
  import ControlView from './ControlView.svelte';

  // Page is reactive and query parameters can change
  let loginUrl = $derived(
    resolve(`login?redirect=${encodeURIComponent(page.url.pathname + page.url.search)}`)
  );

  let details = $state<Promise<PublicShareResponse>>(getShareDetails());
  let shareData = $state<PublicShareResponse | null>(null);
  let enterAsGuestClicked = $state(false);
  let guestName = $state<string | null>(null);
  let entered = $state(false);

  registerBreadcrumbs(() => [
    { label: m.sidebar_public_shares(), href: 'shares/public' },
    { label: shareData?.name ?? m.public_share_label() },
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
  <p>{m.public_share_view_loading()}</p>
{:then shareLinkRoot}
  {#if entered}
    <ControlView {shareLinkRoot} {guestName} />
  {:else}
    <div class="flex h-full w-full items-center justify-center">
      <Card.Root class="w-full max-w-sm">
        <Card.Header class="text-center">
          <Card.Title class="text-xl"><h1>{m.public_share_view_title()}</h1></Card.Title>
          <Card.Description>{m.public_share_view_desc()}</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col gap-2">
          {#if enterAsGuestClicked}
            <Input placeholder={m.public_share_view_guest_name()} bind:value={guestName} />
            <span class="flex gap-2">
              <Button class="grow" variant="outline" onclick={() => (enterAsGuestClicked = false)}
                ><Undo2 />{m.common_back()}</Button
              >

              <Button
                class="grow"
                variant="outline"
                disabled={guestName ? false : true}
                onclick={() => (entered = true)}><LogIn />{m.public_share_view_enter()}</Button
              >
            </span>
          {:else}
            <Button variant="outline" onclick={() => (enterAsGuestClicked = true)}
              ><CircleUser />{m.public_share_view_enter_guest()}</Button
            >

            <Button variant="outline" href={loginUrl}><LogIn />{m.public_share_login()}</Button>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  {/if}
{:catch error}
  <p class="text-destructive">{error.message}</p>
{/await}
