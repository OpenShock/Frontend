<script lang="ts">
  import { shareLinksCreatePublicShare } from '$lib/api';
  import ExpirationPicker from '$lib/components/ExpirationPicker.svelte';
  import { TextInput } from '@openshock/svelte-core/components/input/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog/index.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onCreated: () => void;
  }

  let { open = $bindable<boolean>(), onCreated }: Props = $props();

  let name = $state('');
  let expireOption = $state('never');
  let expireInstant = $state<Temporal.Instant | null>(null);

  function createShareLink() {
    shareLinksCreatePublicShare({
      body: { name, expiresOn: expireInstant ?? undefined },
    })
      .then(() => {
        onCreated();
        toast.success('Created new publicshare');
      })
      .finally(() => {
        open = false;
      });
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create Public Share</Dialog.Title>
    </Dialog.Header>
    <TextInput label="Name" bind:value={name} />
    <ExpirationPicker bind:option={expireOption} bind:instant={expireInstant} />

    <Button onclick={createShareLink}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
