<script lang="ts">
  import { Link } from '@lucide/svelte';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { CopyInput } from '@openshock/svelte-core/components/index.js';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog/index.js';
  import { getSiteShortURL } from '$lib/utils/url';

  interface Props {
    code: string | null;
  }

  let { code = $bindable() }: Props = $props();
  let link = $derived(code ? getSiteShortURL(`/usc/${code}`).href : '');

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

        <CopyInput value={link}>
          {#snippet icon()}
            <Link size="20" />
          {/snippet}
        </CopyInput>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
