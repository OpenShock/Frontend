<script lang="ts">
  import { hubManagementV1Api } from '$lib/api';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { Hub } from './columns';

  interface Props {
    open: boolean;
    hub: Hub;
  }

  let { open = $bindable<boolean>(), hub }: Props = $props();

  let name = $state('');

  function onSubmit() {
    hubManagementV1Api
      .devicesEditDevice(hub.id, { name })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit hub</Dialog.Title>
    </Dialog.Header>
    <TextInput label="Name" placeholder={hub.name} bind:value={name} />
    <Button onclick={onSubmit}>Apply</Button>
  </Dialog.Content>
</Dialog.Root>
