<script lang="ts">
  import { type CreatedAutomationTokenDto, adminRotateAutomationToken } from '#lib/api/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';
  import type { AutomationToken } from './columns';
  import SecretRevealDialog from './dialog-secret-reveal.svelte';

  interface Props {
    open: boolean;
    token: AutomationToken;
    onRotated: () => void;
  }

  let { open = $bindable<boolean>(), token, onRotated }: Props = $props();

  let isSubmitting = $state(false);

  /** Set once the secret has been replaced; the new one is never returned again. */
  let rotated = $state<CreatedAutomationTokenDto | null>(null);

  function rotate() {
    isSubmitting = true;
    adminRotateAutomationToken({ path: { id: token.id } })
      .then((result) => {
        // Close this dialog first so the one-time secret is the only thing on screen.
        open = false;
        rotated = result;
        onRotated();
        toast.success('Rotated automation token');
      })
      .catch(handleApiError)
      .finally(() => (isSubmitting = false));
  }
</script>

<SecretRevealDialog
  token={rotated}
  title="Automation token rotated"
  onDismiss={() => (rotated = null)}
/>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Rotate secret</Dialog.Title>
      <Dialog.Description>
        The current secret for <strong>{token.name}</strong> stops working immediately. Anything still
        using it will be rejected until it is given the new one.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button variant="destructive" onclick={rotate} disabled={isSubmitting}>Rotate</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
