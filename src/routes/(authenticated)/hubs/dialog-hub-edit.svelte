<script lang="ts">
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { Hub } from './columns';

  interface Props {
    open: boolean;
    hub: Hub;
  }

  let { open = $bindable<boolean>(), hub }: Props = $props();
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit hub</Dialog.Title>
    </Dialog.Header>
    <TextInput label="Name" placeholder={hub.name} value={''} />
    <Button>Apply</Button>
  </Dialog.Content>
</Dialog.Root>
