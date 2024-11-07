<script lang="ts">
  import type { User } from './columns';
  import * as Dialog from '$lib/components/ui/dialog';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import AbsolutelySureButton from '$lib/components/AbsolutelySureButton.svelte';

  type Props = {
    open: boolean;
    user: User;
  };

  let { open = $bindable<boolean>(), user }: Props = $props();
</script>

<Dialog.Root {open} onOpenChange={(o) => (open = o)} controlledOpen={true}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete user</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete <strong>{user.name}</strong>?<br />
        All data associated with this user will be permanently deleted.<br />
        <strong>This action is irreversible.</strong>
      </Dialog.Description>
    </Dialog.Header>
    <AbsolutelySureButton text="Delete" onconfirm={() => {}} />
  </Dialog.Content>
</Dialog.Root>
