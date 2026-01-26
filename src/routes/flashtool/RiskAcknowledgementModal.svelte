<script lang="ts">
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';

  interface Props {
    open: boolean;
    onAccept: () => void;
    onCancel?: () => void;
  }

  let { open, onAccept, onCancel }: Props = $props();

  const REQUIRED_TEXT = 'I UNDERSTAND THIS CAN BREAK MY DEVICE';
  const PASTE_REPLACEMENT = 'I DID NOT READ THE WARNING, I JUST COPY-PASTED';

  let acknowledgeText = $state('');
  let acknowledgeChecked = $state(false);

  let canAccept = $derived(acknowledgeChecked && acknowledgeText === REQUIRED_TEXT);

  // Reset + start countdown when dialog opens
  $effect(() => {
    if (!open) return;

    acknowledgeText = '';
    acknowledgeChecked = false;
  });

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    acknowledgeText = PASTE_REPLACEMENT;
  }
</script>

<Dialog.Root {open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>⚠️ UNSTABLE FIRMWARE</Dialog.Title>
      <Dialog.Description class="space-y-3">
        <p>
          You are about to flash <strong class="text-red-500">experimental firmware</strong>
          that is <strong class="text-red-500">known to be unstable</strong>.
        </p>

        <p>
          This may permanently brick your device, require manual recovery, or render it unusable.
        </p>

        <p class="text-red-500 font-semibold">
          We will NOT provide support for issues caused by this firmware.
        </p>

        <p>
          To proceed, type the following phrase <strong>exactly</strong>:
        </p>

        <code class="block rounded bg-muted p-2 text-sm font-mono">
          {REQUIRED_TEXT}
        </code>
      </Dialog.Description>
    </Dialog.Header>

    <TextInput bind:value={acknowledgeText} onpaste={handlePaste} />

    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" bind:checked={acknowledgeChecked} />
      I understand this is entirely my responsibility
    </label>

    <div class="flex justify-end gap-2">
      <Button variant="secondary" onclick={() => onCancel?.()}>Abort</Button>

      <Button variant="destructive" disabled={!canAccept} onclick={onAccept}>
        I ACCEPT FULL RESPONSIBILITY
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
