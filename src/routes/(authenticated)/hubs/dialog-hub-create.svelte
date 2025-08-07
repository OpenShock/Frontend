<script lang="ts">
  import { hubManagementV1Api } from '$lib/api';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  interface Props {
    open: boolean;
  }

  let { open = $bindable<boolean>() }: Props = $props();

  function onSubmit() {
    hubManagementV1Api
      .devicesCreateDevice()
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create hub</Dialog.Title>
    </Dialog.Header>
    <Button onclick={onSubmit}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
