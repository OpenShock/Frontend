<script lang="ts">
  import { Plus } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import MultiSelectCombobox from '@openshock/svelte-core/components/multi-select-combobox/multi-select-combobox.svelte';
  import { ownHubs } from '#lib/state/hubs-state.svelte.js';

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

  function onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    const selectedShockers = shockerIds.map((id) => ({
      id,
      name: availableShockers.find((shocker) => shocker.value === id)?.label || '',
    }));
    onOpenChange(false);
    onAddedShockers(selectedShockers);
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add shockers</Dialog.Title>
      <Dialog.Description>
        Add shockers to this public share. You can set their limits once they are added.
      </Dialog.Description>
    </Dialog.Header>

    <form class="min-w-0 space-y-4" id="add-shockers" onsubmit={onFormSubmit}>
      <MultiSelectCombobox
        bind:selected={shockerIds}
        options={availableShockers}
        label="Shockers"
        placeholder="Select shockers to share..."
        noMatchText="Not matching shockers"
      ></MultiSelectCombobox>
    </form>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => onOpenChange(false)}>Cancel</Button>
      <Button
        type="submit"
        form="add-shockers"
        disabled={!shockerIds.length}
        class="flex items-center"
      >
        <Plus />
        Add Shockers
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
