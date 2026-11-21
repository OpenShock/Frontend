<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Link } from '@lucide/svelte';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { CopyInput } from '@openshock/svelte-core/components';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { getSiteShortURL } from '#lib/utils/url.js';

  interface Props {
    code: string | null;
  }

  let { code = $bindable() }: Props = $props();
  let link = $derived(code ? getSiteShortURL(`usc/${code}`).href : '');

  function onOpenChanged(open: boolean) {
    if (!open) {
      code = null;
    }
  }
</script>

<Dialog.Root bind:open={() => code !== null, onOpenChanged}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.share_code_created_title()}</Dialog.Title>
      <Dialog.Description>{m.share_code_created_desc()}</Dialog.Description>
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
