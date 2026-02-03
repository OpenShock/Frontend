<script lang="ts">
  import { Barcode, Code, User } from '@lucide/svelte';
  import { shockerSharesV2Api } from '$lib/api';
  import { type BasicUserInfo } from '$lib/api/internal/v1';
  import RestrictionsSelector from '$lib/components/shares/restrictions-selector.svelte';
  import UserSelector from '$lib/components/shares/user-selector.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import MultiSelectCombobox from '$lib/components/ui/multi-select-combobox/multi-select-combobox.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { OwnHubsStore } from '$lib/stores/HubsStore';
  import { refreshOutgoingInvites } from '$lib/stores/UserSharesStore';

  let availableShockers = $derived(
    Array.from($OwnHubsStore)
      .flatMap(([, hub]) => hub.shockers)
      .map((shocker) => ({
        value: shocker.id,
        label: shocker.name,
      }))
  );

  interface Props {
    open: boolean;
    onCreatedCode: (code: string) => void;
    onInvitedUser: (user: BasicUserInfo) => void;
  }

  let { open = $bindable(), onCreatedCode, onInvitedUser }: Props = $props();

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

  function onOpenChange(o: boolean) {
    if (!o) {
      shockerIds = [];
      restrictions = getDefaultRestrictions();
      fetchedUser = null;
    }
    open = o;
  }

  async function onFormSubmit() {
    try {
      const createdCode = await shockerSharesV2Api.userSharesCreateShareInvite({
        user: fetchedUser?.id,
        shockers: shockerIds.map((id) => ({
          id: id,
          permissions: { ...restrictions.permissions },
          limits: { ...restrictions.limits },
        })),
      });

      if (fetchedUser) {
        onInvitedUser(fetchedUser);
      } else {
        onCreatedCode(createdCode);
      }
      open = false;
    } catch (error) {
      await handleApiError(error);
    } finally {
      refreshOutgoingInvites();
    }
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>New Share Code</Dialog.Title>
      <Dialog.Description>Create a Share Code or Invite</Dialog.Description>
    </Dialog.Header>

    <form class="modal-form border-surface-500 rounded-container-token min-w-0 space-y-4">
      <UserSelector bind:fetchedUser />

      <MultiSelectCombobox
        bind:selected={shockerIds}
        options={availableShockers}
        label="Shockers"
        placeholder="Select shockers to share..."
        noMatchText="Not matching shockers"
      ></MultiSelectCombobox>

      <RestrictionsSelector
        bind:permissions={restrictions.permissions}
        bind:limits={restrictions.limits}
      />
    </form>
    <Button onclick={onFormSubmit} class="flex items-center">
      {#if fetchedUser}
        <User />
        Send Share Invite
      {:else}
        <Barcode />
        Create Share Code
      {/if}
    </Button>
  </Dialog.Content>
</Dialog.Root>
