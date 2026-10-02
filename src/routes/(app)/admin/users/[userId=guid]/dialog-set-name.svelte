<script lang="ts">
  import { adminSetUserName } from '#lib/api/index.js';
  import UsernameInput from '#lib/components/input/UsernameInput.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    userId: string;
    currentName: string;
    onChanged: () => void;
  }

  let { open = $bindable<boolean>(), userId, currentName, onChanged }: Props = $props();

  let name = $state('');
  let nameValid = $state(false);
  let isSubmitting = $state(false);

  let valid = $derived(nameValid && name !== currentName && !isSubmitting);

  function setName() {
    isSubmitting = true;
    adminSetUserName({ path: { userId }, body: { name } })
      .then(() => {
        onChanged();
        toast.success('Changed username');
        open = false;
        name = '';
      })
      .catch(handleApiError)
      .finally(() => (isSubmitting = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Change username</Dialog.Title>
      <Dialog.Description>
        Renames <strong>{currentName}</strong> immediately, without asking them to confirm. The old name
        is recorded in their name change history.
      </Dialog.Description>
    </Dialog.Header>
    <UsernameInput
      label="New username"
      placeholder={currentName}
      bind:value={name}
      bind:valid={nameValid}
    />
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={setName} disabled={!valid}>Change username</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
