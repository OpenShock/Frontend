<script lang="ts">
  import { accountV1Api } from '$lib/api';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import * as Accordion from '$lib/components/ui/accordion';
  import { Button } from '$lib/components/ui/button';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { UserStore } from '$lib/stores/UserStore';
  import { toast } from 'svelte-sonner';

  import { KeyRound, Mail, User } from '@lucide/svelte';

  let username = $state<string>('');
  let email = $state<string>('');

  let currentPassword = $state<string>('');
  let currentPasswordValid = $derived(currentPassword.length > 0);

  let password = $state<string>('');
  let passwordValid = $state<boolean>(false);

  let passwordConfirm = $state<string>('');

  async function submitUsername() {
    try {
      await accountV1Api.authenticatedAccountChangeUsername({ username });

      toast.success('Username changed successfully');

      UserStore.setSelfName(username);

      username = '';
    } catch (e) {
      await handleApiError(e, (problem) => {
        if (problem.type === 'Account.Username.Invalid') {
          toast.error('Invalid Username');
          return true;
        }
        return false;
      });
    }
  }

  function submitEmail() {
    console.log('Submitting email');
  }

  function submitPassword() {
    console.log('Submitting password');
  }

  let canSubmitPassword = $derived(
    currentPasswordValid && passwordValid && password == passwordConfirm
  );
</script>

{#if $UserStore.self}
  <div class="container mx-auto flex h-full flex-col items-start justify-start gap-4 p-12">
    <h1 class="h1">Account Settings</h1>
    <div
      class="bg-surface-100-800-token flex w-full flex-col items-start gap-y-2 rounded-lg border border-gray-500 p-4"
    >
      <UsernameInput
        label="Username"
        placeholder={$UserStore.self.name}
        autocomplete="off"
        bind:value={username}
        Icon={User}
        button={{ text: 'Change', submits: true, onClick: submitUsername }}
      />

      <EmailInput
        label="Email"
        placeholder={$UserStore.self.email}
        autocomplete="off"
        bind:value={email}
        Icon={Mail}
        button={{ text: 'Change', submits: true, onClick: submitEmail }}
      />

      <Accordion.Root type="single" class="w-full">
        <Accordion.Item>
          <Accordion.Trigger>
            <KeyRound />
            Change your password
          </Accordion.Trigger>
          <Accordion.Content>
            <div class="mx-[-1rem] rounded-lg border border-gray-700 p-5">
              <PasswordInput
                label="Current Password"
                placeholder="Current Password"
                autocomplete="off"
                bind:value={currentPassword}
              />

              <PasswordInput
                label="New Password"
                placeholder="New Password"
                autocomplete="new-password"
                bind:value={password}
                bind:valid={passwordValid}
                validate={true}
                showStrengthMeter={true}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm New Password"
                autocomplete="new-password"
                bind:value={passwordConfirm}
                validate={validatePasswordMatch(passwordConfirm, password)}
              />

              <Button
                class="btn variant-filled-primary"
                type="submit"
                disabled={!canSubmitPassword}
              >
                Change Password
              </Button>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  </div>
{/if}

<!-- TODO: Display error -->
