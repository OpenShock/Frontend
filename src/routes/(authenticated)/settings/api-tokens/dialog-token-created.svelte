<script lang="ts">
  import KeyRound from '@lucide/svelte/icons/key-round';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import * as Dialog from '$lib/components/ui/dialog';

  interface Props {
    token: string | null;
  }

  let { token = $bindable() }: Props = $props();

  function onOpenChanged(open: boolean) {
    if (!open) {
      token = null;
    }
  }
</script>

<Dialog.Root bind:open={() => token != null, onOpenChanged}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>API Token Generated</Dialog.Title>
      <Dialog.Description>
        Please copy your API Token now, you will not be able to view it again later!
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col items-center space-y-4">
      <div class="flex w-full items-center justify-between rounded-md p-2">
        <CopyInput value={token ?? ''}>
          {#snippet icon()}
            <KeyRound size="20" />
          {/snippet}
        </CopyInput>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
