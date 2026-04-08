<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';

  interface Props {
    open: boolean;
    onAccept: () => void;
    onCancel?: () => void;
  }

  let { open, onAccept, onCancel }: Props = $props();
  let acknowledgeChecked = $state(false);
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

        <p class="font-semibold text-red-500">
          We will NOT provide support for issues caused by this firmware.
        </p>
      </Dialog.Description>
    </Dialog.Header>

    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" bind:checked={acknowledgeChecked} />
      I understand this is entirely my responsibility
    </label>

    <div class="flex justify-end gap-2">
      <Button variant="secondary" onclick={() => onCancel?.()}>Abort</Button>

      <Button variant="destructive" disabled={!acknowledgeChecked} onclick={onAccept}>
        I ACCEPT FULL RESPONSIBILITY
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
