<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { OAuthSignupFinalize, OAuthSignupGetData } from '$lib/api/next/oauth';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card/index.js';
  import { FieldDescription } from '$lib/components/ui/field/index.js';
  import { isValidationError, mapToValRes } from '$lib/errorhandling/ValidationProblemDetails';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { userState } from '$lib/state/user-state.svelte';
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
        /* eslint-disable-next-line svelte/no-navigation-without-resolve -- URL is already built with resolve() */
        goto(resolve('/login') + '?message=signup-success');
        return;
      }

      userState.setSelf({
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
        goto(resolve('/login'));
      });
  });
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">
      Sign Up With <span class="capitalize">{page.params.provider}</span>
    </Card.Title>
    <Card.Description>Complete your account details</Card.Description>
  </Card.Header>
  <Card.Content>
    <form class="flex flex-col gap-2" onsubmit={handleSubmission}>
      <UsernameInput
        label="Username"
        placeholder="Username"
        bind:value={username}
        bind:valid={usernameValid}
      />
      <EmailInput label="Email" placeholder="Email" bind:value={email} bind:valid={emailValid} />

      <Button type="submit" class="mt-3" disabled={!canSubmit}>Sign Up</Button>
    </form>
  </Card.Content>
</Card.Root>
<FieldDescription class="px-6 text-center">
  By clicking Sign Up, you agree to our <a href="https://openshock.org/tos">Terms of Service</a>
  and <a href="https://openshock.org/privacy">Privacy Policy</a>.
</FieldDescription>
