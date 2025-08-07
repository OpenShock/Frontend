<script lang="ts">
  import { type DateValue, getLocalTimeZone, today } from '@internationalized/date';
  import { publicShockerSharesApi } from '$lib/api';
  import DatePicker from '$lib/components/input/DatePicker.svelte';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onCreated: () => void;
  }

  let { open = $bindable<boolean>(), onCreated }: Props = $props();

  let name = $state('');
  let expiresOn = $state<DateValue | undefined>(today(getLocalTimeZone()).add({ days: 1 }));

  function createShareLink() {
    publicShockerSharesApi
      .shareLinksCreatePublicShare({
        name,
        expiresOn: expiresOn?.toDate(getLocalTimeZone()) ?? null,
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
    Expires
    <DatePicker bind:value={expiresOn} />
    <Button onclick={createShareLink}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
