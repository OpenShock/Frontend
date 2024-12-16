<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { toast } from 'svelte-sonner';

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

<Dialog.Root {open} onOpenChange={(o) => (open = o)} controlledOpen={true}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>API Token Generated</Dialog.Title>
      <Dialog.Description>
        Please copy your API Token now, you will not be able to view it again later!
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col items-center space-y-4">
      <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <div class="input-group-shim fa fa-key"></div>
        <input readonly type="text" value={token} />
        <button
          onclick={copyToken}
          class="variant-filled-secondary fa fa-copy"
          style="outline-style: none;"
          aria-label="Copy Token"
        ></button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
