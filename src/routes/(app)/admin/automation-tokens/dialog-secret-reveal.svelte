<script lang="ts">
  import type { CreatedAutomationTokenDto } from '#lib/api/index.js';
  import { CircleCheck, KeyRound, TriangleAlert } from '@lucide/svelte';
  import { CopyInput } from '@openshock/svelte-core/components';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';

  interface Props {
    /** The created or rotated token, or null while there is no secret to show. */
    token: CreatedAutomationTokenDto | null;
    title: string;
    onDismiss: () => void;
  }

  let { token, title, onDismiss }: Props = $props();
</script>

<!-- The secret is returned exactly once, so this dialog is not dismissable by
     clicking outside it or pressing escape — only by the button, which the
     admin has to reach past the copy field. -->
<Dialog.Root
  open={token !== null}
  onOpenChange={(open) => {
    if (!open) onDismiss();
  }}
>
  <Dialog.Content
    escapeKeydownBehavior="ignore"
    interactOutsideBehavior="ignore"
    showCloseButton={false}
  >
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <CircleCheck class="text-success size-5" />
        {title}
      </Dialog.Title>
      <Dialog.Description>
        Copy the secret for <strong>{token?.name}</strong> now — it is shown this once and cannot be retrieved
        again.
      </Dialog.Description>
    </Dialog.Header>

    {#if token}
      <CopyInput value={token.secret}>
        {#snippet icon()}
          <KeyRound size="20" />
        {/snippet}
      </CopyInput>
    {/if}

    <p class="text-muted-foreground flex items-start gap-2 text-sm">
      <TriangleAlert class="text-warning size-4 shrink-0" />
      <span>
        This secret lets its holder bypass the protections granted to the token. Store it somewhere
        only the automation can read.
      </span>
    </p>

    <Button onclick={onDismiss}>Done</Button>
  </Dialog.Content>
</Dialog.Root>
