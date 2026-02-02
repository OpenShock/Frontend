<script lang="ts">
  import { Plus } from '@lucide/svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import MultiSelectCombobox from '$lib/components/ui/multi-select-combobox/multi-select-combobox.svelte';
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
    onAddedShockers: (shockers: { id: string; name: string }[]) => void;
  }

  let { open = $bindable(), onAddedShockers }: Props = $props();

  let shockerIds = $state<string[]>([]);

  function onOpenChange(o: boolean) {
    if (!o) {
      shockerIds = [];
    }
    open = o;
  }

  function onFormSubmit() {
    const selectedShockers = shockerIds.map((id) => ({
      id,
      name: availableShockers.find((shocker) => shocker.value === id)?.label || '',
    }));
    shockerIds = [];
    open = false;
    onAddedShockers(selectedShockers);
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add Shockers</Dialog.Title>
      <Dialog.Description
        >Add Shockers to a Public Share, you can set the limits once added.</Dialog.Description
      >
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
    <Button onclick={onFormSubmit} disabled={!shockerIds.length} class="flex items-center">
      <Plus />
      Add Shockers
    </Button>
  </Dialog.Content>
</Dialog.Root>
