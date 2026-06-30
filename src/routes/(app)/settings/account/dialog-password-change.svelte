<script lang="ts">
  import { authenticatedAccountChangePassword } from '$lib/api';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { PasswordInput } from '@openshock/svelte-core/components/input/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePasswordMatch } from '@openshock/svelte-core/inputvalidation/passwordValidator.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let loading = $state<boolean>(false);

  let currentPassword = $state<string>('');
  let currentPasswordValid = $derived(currentPassword.length > 0);

  let password = $state<string>('');
  let passwordValid = $state<boolean>(false);

  let passwordConfirm = $state<string>('');
  let passwordConfirmValid = $derived(validatePasswordMatch(passwordConfirm, password));

  $effect(() => {
    if (open) {
      currentPassword = '';
      password = '';
      passwordConfirm = '';
      passwordValid = false;
    }
  });

  async function submitPassword(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    try {
      await authenticatedAccountChangePassword({
        body: { currentPassword, newPassword: password },
      });

      toast.success('Password has been changed');

      open = false;
    } catch (e) {
      await handleApiError(e);
    } finally {
      loading = false;
    }
  }

  let canSubmitPassword = $derived(
    currentPasswordValid && passwordValid && (passwordConfirmValid?.valid ?? false) && !loading
  );
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Change Password</Dialog.Title>
      <Dialog.Description>Enter your current password and choose a new one.</Dialog.Description>
    </Dialog.Header>

    <form class="space-y-2" onsubmit={submitPassword}>
      <PasswordInput
        label="Current Password"
        placeholder="Current Password"
        autocomplete="current-password"
        bind:value={currentPassword}
        Icon={KeyRound}
      />

      <PasswordInput
        label="New Password"
        placeholder="New Password"
        autocomplete="new-password"
        bind:value={password}
        bind:valid={passwordValid}
        Icon={KeyRound}
        validate
        showStrengthMeter
      />

      <PasswordInput
        label="Confirm New Password"
        placeholder="Confirm New Password"
        autocomplete="new-password"
        bind:value={passwordConfirm}
        Icon={KeyRound}
        validate={passwordConfirmValid}
      />

      <Button type="submit" disabled={!canSubmitPassword}>Change Password</Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
