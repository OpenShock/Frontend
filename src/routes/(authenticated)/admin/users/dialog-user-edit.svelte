<script lang="ts">
  import { type AdminUsersView, RoleType } from '$lib/api/internal/v1';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import * as Dialog from '$lib/components/ui/dialog';

  type Props = {
    open: boolean;
    user: AdminUsersView;
  };

  let { open = $bindable<boolean>(), user }: Props = $props();
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit user</Dialog.Title>
    </Dialog.Header>
    <UsernameInput label="Username" placeholder={user.name} value={''} />
    <EmailInput label="Email" placeholder={user.email} value={''} />
    <div>
      <h2>Roles</h2>
      <div class="border-surface-500 flex flex-col space-y-4 rounded-md border p-4">
        {#each [RoleType.Support, RoleType.Staff, RoleType.Admin, RoleType.System] as role}
          <span><Checkbox checked={user.roles.includes(role)} /> {role}</span>
        {/each}
      </div>
    </div>
    <Button>Apply</Button>
  </Dialog.Content>
</Dialog.Root>
