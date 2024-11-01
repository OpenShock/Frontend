<script lang="ts">
  import { goto } from '$app/navigation';
  import { accountApi } from '$lib/api';
  import PasswordInput from '$lib/components/input/PasswordInput.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { UserStore } from '$lib/stores/UserStore';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';

  let usernameOrEmail = $state('');
  let password = $state('');

  function handleSubmission(ev: SubmitEvent) {
    accountApi
      .accountLogin({ email: usernameOrEmail, password })
      .then(() => {
        UserStore.refreshSelf();
        goto('/home');
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="text-3xl">Login</Card.Title>
  </Card.Header>
  <Card.Content>
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

      <Button
        type="submit"
        disabled={usernameOrEmail.length === 0 || password.length === 0}
      >
        Log In
      </Button>
    </form>
  </Card.Content>
</Card.Root>
