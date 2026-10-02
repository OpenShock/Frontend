<script lang="ts">
  import { RoleType, adminModifyUser } from '#lib/api/index.js';
  import type { AdminUsersView } from '#lib/api/index.js';
  import { EmailInput } from '@openshock/svelte-core/components/input';
  import UsernameInput from '#lib/components/input/UsernameInput.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Checkbox } from '@openshock/svelte-core/components/ui/checkbox';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';

  interface Props {
    open: boolean;
    user: AdminUsersView;
  }

  let { open = $bindable<boolean>(), user }: Props = $props();

  let username = $state<string>('');
  let usernameValid = $state(true);
  let usernameSet = $derived(username.length > 0 && username != user.name);
  let email = $state<string>('');
  let emailValid = $state(true);
  let emailSet = $derived(email.length > 0 && email != user.email);

  let submitting = $state(false);

  async function sendit() {
    if (submitting) return;
    submitting = true;
    try {
      await adminModifyUser({
        path: { userId: user.id },
        body: {
          name: usernameSet ? username : null,
          email: emailSet ? email : null,
        },
      });
      open = false;
    } catch (error) {
      await handleApiError(error);
    } finally {
      submitting = false;
    }
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
      <div class="flex flex-col space-y-4 rounded-md border p-4">
        {#each [RoleType.Support, RoleType.Staff, RoleType.Admin, RoleType.System] as role (role)}
          <span><Checkbox checked={user.roles.includes(role)} /> {role}</span>
        {/each}
      </div>
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button
        onclick={sendit}
        disabled={submitting ||
          (usernameSet && !usernameValid) ||
          (emailSet && !emailValid) ||
          (!usernameSet && !emailSet)}
      >
        Apply
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
