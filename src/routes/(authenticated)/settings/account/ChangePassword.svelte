<script lang="ts">
  import { KeyRound } from '@lucide/svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';

  let currentPassword = $state<string>('');
  let currentPasswordValid = $derived(currentPassword.length > 0);

  let password = $state<string>('');
  let passwordValid = $state<boolean>(false);

  let passwordConfirm = $state<string>('');

  function submitPassword() {
    console.log('Submitting password');
  }

  let canSubmitPassword = $derived(
    currentPasswordValid && passwordValid && password == passwordConfirm
  );
</script>

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
  validate={true}
  showStrengthMeter={true}
/>

<PasswordInput
  label="Confirm New Password"
  placeholder="Confirm New Password"
  autocomplete="new-password"
  bind:value={passwordConfirm}
  Icon={KeyRound}
  validate={validatePasswordMatch(passwordConfirm, password)}
/>

<Button type="submit" disabled={!canSubmitPassword}>Change Password</Button>
