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

  let tab = $derived(() => {
    switch (page.url.pathname) {
      case '/shares/user/outgoing':
        return 'shares';
      case '/shares/user/incoming':
        return 'incoming';
      case '/shares/user/outstanding':
        return 'outstanding';
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
  });
</script>

<DialogShareCodeCreate bind:open={createDialogOpen} {onCreatedCode} {onInvitedUser} />
<DialogShareCodeCreated bind:code={createdCode} />
<DialogShareCodeRedeem bind:open={redeemDialogOpen} />

<div class="h-full m-8 mt-4 flex flex-col gap-4">
  <div class="flex-none flex w-full">
    <Tabs.Root value={tab()} class="w-[400px]">
      <Tabs.List>
        <Tabs.Trigger value="shares" onclick={() => navigateTo('outgoing')}>Shares</Tabs.Trigger>
        <Tabs.Trigger value="outstanding" onclick={() => navigateTo('outstanding')}
          >Outstanding Invites & Codes</Tabs.Trigger
        >
        <Tabs.Trigger value="incoming" onclick={() => navigateTo('incoming')}
          >Shared with Me</Tabs.Trigger
        >
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
