<script lang="ts">
  import { Link } from '@lucide/svelte';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { PUBLIC_SITE_SHORT_URL } from '$env/static/public';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import * as Dialog from '$lib/components/ui/dialog';

  interface Props {
    code: string | null;
  }

  let { code = $bindable() }: Props = $props();
  let link = $derived(() => new URL(`/usc/${code}`, PUBLIC_SITE_SHORT_URL).toString());

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
      <Dialog.Description>Please copy share code or code link!</Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col items-center space-y-4">
      <div class="flex w-full flex-col items-center justify-between gap-2 rounded-md p-2">
        <CopyInput value={code!}>
          {#snippet icon()}
            <KeyRound size="20" />
          {/snippet}
        </CopyInput>

        <CopyInput value={link()}>
          {#snippet icon()}
            <Link size="20" />
          {/snippet}
        </CopyInput>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
