<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';

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
      <Dialog.Title>{m.terminal_risk_title()}</Dialog.Title>
      <Dialog.Description class="space-y-3">
        <p>
          <ParaglideMessage message={m.terminal_risk_intro}>
            {#snippet strong({ children })}
              <strong class="text-destructive">{@render children?.()}</strong>
            {/snippet}
          </ParaglideMessage>
        </p>

        <p>
          {m.terminal_risk_brick()}
        </p>

        <p class="text-destructive font-semibold">
          {m.terminal_risk_no_support()}
        </p>
      </Dialog.Description>
    </Dialog.Header>

    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" bind:checked={acknowledgeChecked} />
      {m.terminal_risk_acknowledge()}
    </label>

    <div class="flex justify-end gap-2">
      <Button variant="secondary" onclick={() => onCancel?.()}>{m.terminal_risk_abort()}</Button>

      <Button variant="destructive" disabled={!acknowledgeChecked} onclick={onAccept}>
        {m.terminal_risk_accept()}
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
