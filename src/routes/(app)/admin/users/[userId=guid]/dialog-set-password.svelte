<script lang="ts">
  import { adminSetUserPassword } from '#lib/api/index.js';
  import { PasswordInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    userId: string;
    userName: string;
    onChanged: () => void;
  }

  let { open = $bindable<boolean>(), userId, userName, onChanged }: Props = $props();

  let password = $state('');
  let passwordValid = $state(false);
  let isSubmitting = $state(false);

  let valid = $derived(passwordValid && !isSubmitting);

  function setPassword() {
    isSubmitting = true;
    adminSetUserPassword({ path: { userId }, body: { password } })
      .then(() => {
        onChanged();
        toast.success('Set password');
        open = false;
        password = '';
      })
      .catch(handleApiError)
      .finally(() => (isSubmitting = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Set password</Dialog.Title>
      <Dialog.Description>
        Replaces the password on <strong>{userName}</strong>'s account immediately. They are not
        notified, and you will be the only one who knows it until they reset it themselves.
      </Dialog.Description>
    </Dialog.Header>
    <PasswordInput
      label="New password"
      autocomplete="new-password"
      bind:value={password}
      bind:valid={passwordValid}
      validate
      showStrengthMeter
      onPwnedCheckError={handleApiError}
    />
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={setPassword} disabled={!valid}>Set password</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
