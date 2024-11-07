<script lang="ts">
  import type { User } from './columns';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import UsernameInput from '$lib/components/input/UsernameInput.svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';

  type Props = {
    open: boolean;
    user: User;
  };

  let { open = $bindable<boolean>(), user }: Props = $props();
</script>

<Dialog.Root {open} onOpenChange={(o) => (open = o)} controlledOpen={true}>
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
