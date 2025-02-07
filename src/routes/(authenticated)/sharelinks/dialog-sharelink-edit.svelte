<script lang="ts">
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { ShareLink } from './columns';

  type Props = {
    open: boolean;
    sharelink: ShareLink;
  };

  let { open = $bindable<boolean>(), sharelink }: Props = $props();
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit ShareLink</Dialog.Title>
    </Dialog.Header>
    <TextInput label="Name" placeholder={sharelink.name} value={''} />
    <Button>Apply</Button>
  </Dialog.Content>
</Dialog.Root>
