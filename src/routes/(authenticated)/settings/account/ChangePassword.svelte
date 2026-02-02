<script lang="ts">
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { accountV1Api } from '$lib/api';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { toast } from 'svelte-sonner';

  let loading = $state<boolean>(false);

  let currentPassword = $state<string>('');
  let currentPasswordValid = $derived(currentPassword.length > 0);

  let password = $state<string>('');
  let passwordValid = $state<boolean>(false);

  let passwordConfirm = $state<string>('');
  let passwordConfirmValid = $derived(validatePasswordMatch(passwordConfirm, password));

  async function submitPassword(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    try {
      await accountV1Api.authenticatedAccountChangePassword({
        currentPassword,
        newPassword: password,
      });

      toast.success('Password has been changed');

      currentPassword = '';
      password = '';
      passwordConfirm = '';
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

<form class="w-full" onsubmit={submitPassword}>
  <PasswordInput
    label="Current Password"
    placeholder="Current Password"
    autocomplete="off"
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
