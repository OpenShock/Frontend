<script lang="ts">
  import { shareLinksCreatePublicShare } from '#lib/api/index.js';
  import ExpirationPicker from '#lib/components/ExpirationPicker.svelte';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onCreated: () => void;
  }

  let { open = $bindable<boolean>(), onCreated }: Props = $props();

  let name = $state('');
  let expireOption = $state('never');
  let expireInstant = $state<Temporal.Instant | null>(null);

  let submitting = $state(false);

  async function createShareLink() {
    if (submitting) return;
    submitting = true;
    try {
      await shareLinksCreatePublicShare({
        body: { name, expiresOn: expireInstant ?? undefined },
      });
      onCreated();
      toast.success('Created new public share');
      open = false;
    } catch (error) {
      await handleApiError(error);
    } finally {
      submitting = false;
    }
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create public share</Dialog.Title>
    </Dialog.Header>
    <TextInput label="Name" bind:value={name} />
    <ExpirationPicker bind:option={expireOption} bind:instant={expireInstant} />

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={createShareLink} disabled={submitting}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
