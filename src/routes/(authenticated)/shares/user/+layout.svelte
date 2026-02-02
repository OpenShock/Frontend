<script lang="ts">
  import { Barcode, Plus } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { BasicUserInfo } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import { refreshOwnHubs } from '$lib/stores/HubsStore';
  import { type Snippet, onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import DialogShareCodeCreate from './dialog-share-code-create.svelte';
  import DialogShareCodeCreated from './dialog-share-code-created.svelte';
  import DialogShareCodeRedeem from './dialog-share-code-redeem.svelte';

  let createDialogOpen = $state(false);
  let redeemDialogOpen = $state(false);
  let createdCode = $state<string | null>(null);
  let redeemUserInput = $state<string>('');

  let tab = $derived(() => {
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

  function navigateTo(path: string) {
    goto('/shares/user/' + path);
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

<div class="h-full m-8 mt-4 flex flex-col gap-4">
  <div class="flex-none flex w-full">
    <Tabs.Root value={tab()} class="w-[400px]">
      <Tabs.List>
        <Tabs.Trigger value="shares" onclick={() => navigateTo('outgoing')}>Shares</Tabs.Trigger>
        <Tabs.Trigger value="incoming" onclick={() => navigateTo('incoming')}
          >Shared with Me</Tabs.Trigger
        >
        <Tabs.Trigger value="invites" onclick={() => navigateTo('invites')}>Invites</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>

    <div class="flex-grow"></div>

    <span>
      <Button onclick={() => (redeemDialogOpen = true)} class="self-end">
        <Barcode />
        Redeem Code
      </Button>
      <Button onclick={() => (createDialogOpen = true)} class="self-end">
        <Plus />
        New Share
      </Button>
    </span>
  </div>

  {@render children?.()}
</div>
