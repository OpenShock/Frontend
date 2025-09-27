<script lang="ts">
  import KeyRound from '@lucide/svelte/icons/key-round';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import * as Dialog from '$lib/components/ui/dialog';

  interface Props {
    code: string | null;
  }

  let { code = $bindable() }: Props = $props();

  function onOpenChanged(open: boolean) {
    if (!open) {
      code = null;
    }
  }
</script>

<Dialog.Root bind:open={() => code !== null, onOpenChanged}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Share Code Generated</Dialog.Title>
      <Dialog.Description>Please copy share code!</Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col items-center space-y-4">
      <div class="flex w-full items-center justify-between rounded-md p-2">
        <CopyInput value={code!}>
          {#snippet icon()}
            <KeyRound size="20" />
          {/snippet}
        </CopyInput>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
