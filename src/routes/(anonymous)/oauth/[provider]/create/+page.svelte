<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { OAuthSignupFinalize, OAuthSignupGetData } from '$lib/api/next/oauth';
  import Container from '$lib/components/Container.svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { UserStore } from '$lib/stores/UserStore';
  import { onMount } from 'svelte';

  let username = $state<string>('');
  let usernameValid = $state<boolean>(false);

  let email = $state('');
  let emailValid = $state(false);

  let password = $state('');

  let canSubmit = $derived(usernameValid && emailValid);

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!username || !email) {
      return;
    }

    try {
      const account = await OAuthSignupFinalize(page.params.provider!, {
        username,
        email,
        password,
      });

      if (!account.isVerified) {
        goto('/login?message=signup-success');
        return;
      }

      UserStore.setSelf({
        id: account.accountId,
        name: account.accountName,
        avatar: account.profileImage,
        email: account.accountEmail,
        roles: account.accountRoles,
      });

      goto(resolve('/home'));
    } catch (error) {
      await handleApiError(error, (problem) => {
        if (!isValidationError(problem)) return false;

        console.log(mapToValRes(problem, 'Username'));
        console.log(mapToValRes(problem, 'Password'));
        console.log(mapToValRes(problem, 'Email'));
        console.log(mapToValRes(problem, 'TurnstileResponse'));

        return true;
      });
    }
  }

  onMount(() => {
    OAuthSignupGetData(page.params.provider!)
      .then((data) => {
        if (data.displayName) {
          username = data.displayName;
          usernameValid = true;
        }
        if (data.email) {
          email = data.email;
          emailValid = true;
        }
      })
      .catch((err) => {
        console.error('Failed to fetch OAuth signup data', err);
        goto('/login');
      });
  });
</script>

<Container class="items-center">
  <form class="flex flex-col gap-2" onsubmit={handleSubmission}>
    <div class="text-3xl font-semibold text-nowrap">
      Sign Up With <span class="capitalize">{page.params.provider}</span>
    </div>
    <UsernameInput
      label="Username"
      placeholder="Username"
      bind:value={username}
      bind:valid={usernameValid}
    />
    <EmailInput label="Email" placeholder="Email" bind:value={email} bind:valid={emailValid} />

    <Button type="submit" disabled={!canSubmit}>Sign Up</Button>
  </form>
</Container>
