<script lang="ts">
  import { adminApi } from '$lib/api';
  import { type AdminUsersView, RoleType } from '$lib/api/internal/v1';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  interface Props {
    open: boolean;
    user: AdminUsersView;
  }

  let { open = $bindable<boolean>(), user }: Props = $props();

  let username = $state<string>('');
  let usernameValid = $state(true);
  let usernameReady = $derived(usernameValid && username.length > 0 && username != user.name);
  let email = $state<string>('');
  let emailValid = $state(true);
  let emailReady = $derived(emailValid && email.length > 0 && email != user.email);

  function sendit() {
    adminApi
      .adminModifyUser(user.id, {
        name: usernameReady ? username : null,
        email: emailReady ? email : null,
      })
      .then(() => (open = false))
      .catch(handleApiError);
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit user</Dialog.Title>
    </Dialog.Header>
    <UsernameInput
      label="Username"
      placeholder={user.name}
      bind:value={username}
      bind:valid={usernameValid}
    />
    <EmailInput label="Email" placeholder={user.email} bind:value={email} bind:valid={emailValid} />
    <div>
      <h2>Roles</h2>
      <div class="border-surface-500 flex flex-col space-y-4 rounded-md border p-4">
        {#each [RoleType.Support, RoleType.Staff, RoleType.Admin, RoleType.System] as role}
          <span><Checkbox checked={user.roles.includes(role)} /> {role}</span>
        {/each}
      </div>
    </div>
    <Button onclick={sendit} disabled={usernameReady && emailReady}>Apply</Button>
  </Dialog.Content>
</Dialog.Root>
