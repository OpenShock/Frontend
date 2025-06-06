<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { accountV2Api } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { UserStore } from '$lib/stores/UserStore';

  let usernameOrEmail = $state<string>('');
  let password = $state<string>('');
  let turnstileResponse = $state<string | null>(null);

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!usernameOrEmail || !password || !turnstileResponse) {
      return;
    }

    try {
      await accountV2Api.accountLoginV2({ usernameOrEmail, password, turnstileResponse });
      await UserStore.refreshSelf();
      goto(page.url.searchParams.get('redirect') ?? '/home');
    } catch (error) {
      handleApiError(error);
    }
  }

  let canSubmit = $derived(
    usernameOrEmail.length > 0 && password.length > 0 && turnstileResponse != null
  );
</script>

<Container>
  <CardHeader>
    <CardTitle class="text-3xl">Login</CardTitle>
  </CardHeader>
  <CardContent>
    <form class="flex flex-col space-y-4" onsubmit={handleSubmission}>
      <TextInput
        label="Username or Email"
        placeholder="Username or Email"
        autocomplete="on"
        bind:value={usernameOrEmail}
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        autocomplete="new-password"
        bind:value={password}
      />

      <Turnstile action="signin" bind:response={turnstileResponse} />

      <Button type="submit" disabled={!canSubmit}>Log In</Button>

      <a class="text-blue-500 underline" href="/forgot-password">I forgot my password</a>
    </form>
  </CardContent>
</Container>
