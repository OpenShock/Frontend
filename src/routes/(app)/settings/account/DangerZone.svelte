<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { authenticatedAccountDeactivate } from '$lib/api';
  import { Button } from '$hadcn/button';
  import * as Dialog from '$hadcn/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  let deactivateDialogOpen = $state(false);

  function deactivateAccount() {
    authenticatedAccountDeactivate()
      .then(() => {
        toast.success('Account deactivated successfully');
        goto(resolve('/'));
      })
      .catch(handleApiError)
      .finally(() => {
        deactivateDialogOpen = false;
      });
  }
</script>

<Dialog.Root bind:open={() => deactivateDialogOpen, (o) => (deactivateDialogOpen = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Deactivate Account</Dialog.Title>
      <Dialog.Description>Are you sure you want to deactivate your account?</Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" class="w-full" onclick={deactivateAccount}>
      Deactivate Account
    </Button>
  </Dialog.Content>
</Dialog.Root>

<div
  class="flex w-full flex-col items-start gap-y-4 rounded-lg border border-red-600/60 bg-red-950/10 p-4"
>
  <h2 class="text-base font-semibold text-red-500">Danger Zone</h2>
  <Button variant="destructive" class="w-full" onclick={() => (deactivateDialogOpen = true)}>
    Deactivate Account
  </Button>
</div>
