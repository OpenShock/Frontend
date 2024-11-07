<script lang="ts">
  import type { Hub } from './columns';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import TextInput from '$lib/components/input/TextInput.svelte';

  type Props = {
    open: boolean;
    hub: Hub;
  };

  let { open = $bindable<boolean>(), hub }: Props = $props();
</script>

<Dialog.Root {open} onOpenChange={(o) => (open = o)} controlledOpen={true}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit hub</Dialog.Title>
    </Dialog.Header>
    <TextInput label="Name" placeholder={hub.name} value={''} />
    <Button>Apply</Button>
  </Dialog.Content>
</Dialog.Root>
