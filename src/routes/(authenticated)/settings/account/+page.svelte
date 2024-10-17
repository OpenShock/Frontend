<script lang="ts">
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import { validatePasswordMatch } from '$lib/inputvalidation/passwordValidator';
  import { UserStore } from '$lib/stores/UserStore';
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import { authenticatedAccountApi } from '$lib/api';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';

  const toastStore = getToastStore();

  let username: string = '';
  let email: string = '';

  let currentPassword: string = '';
  $: currentPasswordValid = currentPassword.length > 0;

  let password: string = '';
  let passwordValid: boolean = false;

  let passwordConfirm: string = '';

  async function submitUsername() {
    try {
      const response = await authenticatedAccountApi.authenticatedAccountChangeUsername({
        username: username,
      });

      toastStore.trigger({
        background: 'variant-filled-success',
        message: 'Username changed successfully',
      });
    } catch (e) {
      await handleApiError(e, toastStore, (problem) => {
        if (problem.type === 'Account.Username.Invalid') {
          toastStore.trigger({
            background: 'variant-filled-error',
            message: '',
          });
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

  $: canSubmitPassword = currentPasswordValid && passwordValid && password == passwordConfirm;
</script>

{#if $UserStore.self}
  <div class="container h-full mx-auto p-12 flex flex-col justify-start items-start gap-4">
    <h1 class="h1">Account Settings</h1>
    <div
      class="w-full flex flex-col items-start gap-y-2 p-4 bg-surface-100-800-token rounded-lg border border-gray-500"
    >
      <UsernameInput
        label="Username"
        placeholder={$UserStore.self.name}
        autocomplete="off"
        bind:value={username}
        icon="fa-user"
        button={{ text: 'Change', submits: true, onClick: submitUsername }}
      />

      <EmailInput
        label="Email"
        placeholder={$UserStore.self.email}
        autocomplete="off"
        bind:value={email}
        icon="fa-envelope"
        button={{ text: 'Change', submits: true, onClick: submitEmail }}
      />

      <Accordion>
        <AccordionItem>
          <svelte:fragment slot="lead"><i class="fa fa-key"></i></svelte:fragment>
          <svelte:fragment slot="summary">Change your password</svelte:fragment>
          <svelte:fragment slot="content">
            <div class="rounded-lg border border-gray-700 p-5 mx-[-1rem]">
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

              <button class="btn variant-filled-primary" type="submit" disabled={!canSubmitPassword}
                >Change Password</button
              >
            </div>
          </svelte:fragment>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
{/if}

<!-- TODO: Display error -->
