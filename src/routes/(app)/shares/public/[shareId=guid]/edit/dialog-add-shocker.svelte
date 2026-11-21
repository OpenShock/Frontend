<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
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
      <Dialog.Title>{m.public_share_add_title()}</Dialog.Title>
      <Dialog.Description>
        {m.public_share_add_desc()}
      </Dialog.Description>
    </Dialog.Header>

    <form class="min-w-0 space-y-4" id="add-shockers" onsubmit={onFormSubmit}>
      <MultiSelectCombobox
        bind:selected={shockerIds}
        options={availableShockers}
        label={m.shockers_title()}
        placeholder={m.public_share_add_placeholder()}
        noMatchText={m.public_share_add_no_match()}
      ></MultiSelectCombobox>
    </form>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => onOpenChange(false)}>{m.common_cancel()}</Button>
      <Button
        type="submit"
        form="add-shockers"
        disabled={!shockerIds.length}
        class="flex items-center"
      >
        <Plus />
        {m.public_share_add_submit()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
