<script lang="ts">
  import { Barcode, Plus } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { BasicUserInfo } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import { refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { type Snippet, onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import DialogShareCodeCreate from './dialog-share-code-create.svelte';
  import DialogShareCodeCreated from './dialog-share-code-created.svelte';
  import DialogShareCodeRedeem from './dialog-share-code-redeem.svelte';
  import { resolve } from '$app/paths';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  registerBreadcrumbs(() => [{ label: 'User Shares', href: '/shares/user/outgoing' }]);

  let createDialogOpen = $state(false);
  let redeemDialogOpen = $state(false);
  let createdCode = $state<string | null>(null);
  let redeemUserInput = $state<string>('');

  let tab = $derived.by(() => {
    switch (page.url.pathname) {
      case '/shares/user/outgoing':
        return 'shares';
      case '/shares/user/incoming':
        return 'incoming';
      case '/shares/user/invites':
        return 'invites';
      default:
        return 'shares';
    }
  });

  let { children }: { children?: Snippet } = $props();

  function onCreatedCode(code: string) {
    createdCode = code;
  }

  function onInvitedUser(user: BasicUserInfo) {
    toast.success(`Sent a shocker invite to ${user.name}`);
  }

  function navigateTo(path: 'incoming' | 'outgoing' | 'invites') {
    goto(resolve(`/shares/user/${path}`));
  }

  onMount(() => {
    refreshOwnHubs();

    // Check for redeem query param and redeem pop
    if (page.url.searchParams.has('redeem')) {
      const code = page.url.searchParams.get('redeem');
      redeemDialogOpen = true;
      redeemUserInput = code ?? '';
    }
  });
</script>

<DialogShareCodeCreate bind:open={createDialogOpen} {onCreatedCode} {onInvitedUser} />
<DialogShareCodeCreated bind:code={createdCode} />
<DialogShareCodeRedeem bind:open={redeemDialogOpen} bind:userInput={redeemUserInput} />

<Container class="flex flex-col">
  <PageHeader title="User Shares" subtitle="Direct permanent shares with users">
    <Button onclick={() => (redeemDialogOpen = true)} class="self-end">
      <Barcode />
      Redeem Code
    </Button>
    <Button onclick={() => (createDialogOpen = true)} class="self-end">
      <Plus />
      New Share
    </Button>
  </PageHeader>

  <div class="flex w-full flex-none">
    <Tabs.Root value={tab} class="w-100">
      <Tabs.List>
        <Tabs.Trigger value="shares" onclick={() => navigateTo('outgoing')}>Shares</Tabs.Trigger>
        <Tabs.Trigger value="incoming" onclick={() => navigateTo('incoming')}
          >Shared with Me</Tabs.Trigger
        >
        <Tabs.Trigger value="invites" onclick={() => navigateTo('invites')}>Invites</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  </div>

  <div class="flex w-full flex-col space-y-4 overflow-auto">
    {@render children?.()}
  </div>
</Container>
