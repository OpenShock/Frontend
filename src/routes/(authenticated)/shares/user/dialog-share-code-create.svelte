<script lang="ts">
  import { shockerSharesV2Api } from '$lib/api';
  import { type ShockerPermLimitPair } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import MultiSelectCombobox from '$lib/components/ui/multi-select-combobox/multi-select-combobox.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { OwnHubsStore } from '$lib/stores/HubsStore';

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
    onCreated: (code: string) => void;
  }

  let { open = $bindable(), onCreated }: Props = $props();

  let shockerIds = $state<string[]>([]);
  let restrictions = $state<ShockerPermLimitPair>(getDefaultRestrictions());

  function getDefaultRestrictions(): ShockerPermLimitPair {
    return {
      limits: {
        duration: 30_000,
        intensity: 100,
      },
      permissions: {
        shock: false,
        vibrate: false,
        sound: false,
        live: false,
      },
    };
  }

  function onOpenChange(o: boolean) {
    if (!o) {
      shockerIds = [];
      restrictions = getDefaultRestrictions();
    }
    open = o;
  }

  async function onFormSubmit() {
    try {
      const createdCode = await shockerSharesV2Api.sharesCreateShareInvite({
        shockers: shockerIds.map((id) => ({
          shockerId: id,
          permissions: restrictions.permissions,
          limits: restrictions.limits,
        })),
      });
      onCreated(createdCode);
      open = false;
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>New Share Code</Dialog.Title>
      <Dialog.Description>Example text</Dialog.Description>
    </Dialog.Header>

    <form class="modal-form border-surface-500 rounded-container-token space-y-4 min-w-0">
      <MultiSelectCombobox
        bind:selected={shockerIds}
        options={availableShockers}
        label="Shockers"
        placeholder="Select shockers to share..."
        noMatchText="Not matching shockers"
      ></MultiSelectCombobox>
    </form>
    <Button onclick={onFormSubmit}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
