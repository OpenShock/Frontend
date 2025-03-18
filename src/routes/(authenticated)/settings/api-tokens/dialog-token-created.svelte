<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { toast } from 'svelte-sonner';

  import { Copy, KeyRound } from '@lucide/svelte';

  type Props = {
    open: boolean;
    token: string | null;
  };

  let { open = $bindable(), token }: Props = $props();

  function copyToken() {
    if (token == null) return;
    navigator.clipboard.writeText(token);
    toast.success('Token copied to clipboard');
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>API Token Generated</Dialog.Title>
      <Dialog.Description>
        Please copy your API Token now, you will not be able to view it again later!
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col items-center space-y-4">
      <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <KeyRound />
        <input readonly type="text" value={token} />
        <button
          onclick={copyToken}
          class="variant-filled-secondary"
          style="outline-style: none;"
          aria-label="Copy Token"
        >
          <Copy />
        </button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
