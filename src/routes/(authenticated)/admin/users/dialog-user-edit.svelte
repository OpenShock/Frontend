<script lang="ts">
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { User } from './columns';

  type Props = {
    open: boolean;
    user: User;
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
    <TextInput type="text" label="Rank" placeholder={user.rank} value={''} />
    <Button>Apply</Button>
  </Dialog.Content>
</Dialog.Root>
