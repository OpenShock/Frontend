<script lang="ts">
  import { adminSetUserEmail } from '#lib/api/index.js';
  import { EmailInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    userId: string;
    currentEmail: string;
    onChanged: () => void;
  }

  let { open = $bindable<boolean>(), userId, currentEmail, onChanged }: Props = $props();

  let email = $state('');
  let emailValid = $state(false);
  let isSubmitting = $state(false);

  let valid = $derived(emailValid && email !== currentEmail && !isSubmitting);

  function setEmail() {
    isSubmitting = true;
    adminSetUserEmail({ path: { userId }, body: { email } })
      .then(() => {
        onChanged();
        toast.success('Changed email address');
        open = false;
        email = '';
      })
      .catch(handleApiError)
      .finally(() => (isSubmitting = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Change email address</Dialog.Title>
      <Dialog.Description>
        Replaces the address on this account immediately. No confirmation mail is sent to either
        address, so the account can no longer be recovered through <strong>{currentEmail}</strong>.
      </Dialog.Description>
    </Dialog.Header>
    <EmailInput
      label="New email"
      placeholder={currentEmail}
      bind:value={email}
      bind:valid={emailValid}
    />
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={setEmail} disabled={!valid}>Change email</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
