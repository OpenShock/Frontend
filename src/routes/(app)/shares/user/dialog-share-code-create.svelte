<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { userSharesCreateShareInvite } from '#lib/api/index.js';
  import type { BasicUserInfo } from '#lib/api/index.js';
  import { Barcode, User } from '@lucide/svelte';
  import RestrictionsSelector from '#lib/components/shares/restrictions-selector.svelte';
  import UserSelector from '#lib/components/shares/user-selector.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import MultiSelectCombobox from '@openshock/svelte-core/components/multi-select-combobox/multi-select-combobox.svelte';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { ownHubs } from '#lib/state/hubs-state.svelte.js';
  import { refreshOutgoingInvites } from '#lib/state/user-shares-state.svelte.js';

  let availableShockers = $derived(
    ownHubs
      .values()
      .flatMap((hub) => hub.shockers)
      .map((shocker) => ({
        value: shocker.id,
        label: shocker.name,
      }))
      .toArray()
  );

  interface Props {
    open: boolean;
    preselectedShockerIds?: string[];
    onCreatedCode: (code: string) => void;
    onInvitedUser: (user: BasicUserInfo) => void;
  }

  let {
    open = $bindable(),
    preselectedShockerIds = [],
    onCreatedCode,
    onInvitedUser,
  }: Props = $props();

  interface ShockerPermLimitPairButNotNull {
    permissions: {
      shock: boolean;
      vibrate: boolean;
      sound: boolean;
      live: boolean;
    };
    limits: {
      intensity: number;
      duration: number;
    };
  }

  let shockerIds = $state<string[]>([]);
  let restrictions = $state<ShockerPermLimitPairButNotNull>(getDefaultRestrictions());
  let fetchedUser = $state<BasicUserInfo | null>(null);
  let submitting = $state(false);

  function getDefaultRestrictions(): ShockerPermLimitPairButNotNull {
    return {
      limits: {
        duration: 10_000,
        intensity: 25,
      },
      permissions: {
        shock: true,
        vibrate: true,
        sound: true,
        live: true,
      },
    };
  }

  // Seed preselection whenever the dialog transitions to open.
  let wasOpen = false;
  $effect(() => {
    if (open && !wasOpen && preselectedShockerIds.length > 0) {
      shockerIds = [...preselectedShockerIds];
    }
    wasOpen = open;
  });

  function onOpenChange(o: boolean) {
    if (!o) {
      shockerIds = [];
      restrictions = getDefaultRestrictions();
      fetchedUser = null;
    }
    open = o;
  }

  async function onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (submitting || shockerIds.length === 0) return;
    submitting = true;
    try {
      const createdCode = await userSharesCreateShareInvite({
        body: {
          user: fetchedUser?.id,
          shockers: shockerIds.map((id) => ({
            id: id,
            permissions: { ...restrictions.permissions },
            limits: { ...restrictions.limits },
          })),
        },
      });

      if (fetchedUser) {
        onInvitedUser(fetchedUser);
      } else {
        onCreatedCode(createdCode);
      }
      onOpenChange(false);
    } catch (error) {
      await handleApiError(error);
    } finally {
      submitting = false;
      refreshOutgoingInvites();
    }
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.share_code_create_title()}</Dialog.Title>
      <Dialog.Description>{m.share_code_create_desc()}</Dialog.Description>
    </Dialog.Header>

    <form class="min-w-0 space-y-4" id="create-share-code" onsubmit={onFormSubmit}>
      <UserSelector bind:fetchedUser />

      <MultiSelectCombobox
        bind:selected={shockerIds}
        options={availableShockers}
        label={m.shockers_title()}
        placeholder={m.share_code_shocker_placeholder()}
        noMatchText={m.share_code_no_match()}
      ></MultiSelectCombobox>

      <RestrictionsSelector
        bind:permissions={restrictions.permissions}
        bind:limits={restrictions.limits}
      />
    </form>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => onOpenChange(false)}>{m.common_cancel()}</Button>
      <Button
        type="submit"
        form="create-share-code"
        class="flex items-center"
        disabled={submitting || shockerIds.length === 0}
      >
        {#if fetchedUser}
          <User />
          {m.share_code_send_invite()}
        {:else}
          <Barcode />
          {m.share_code_create()}
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
