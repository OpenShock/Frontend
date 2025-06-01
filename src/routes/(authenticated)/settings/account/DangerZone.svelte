<script lang="ts">
  import { accountV1Api } from '$lib/api';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';

  let deactivateDialogOpen = $state(false);

  function deactivateAccount() {
    accountV1Api
      .authenticatedAccountDeactivate()
      .then(() => {
        // Handle successful deactivation, e.g., redirect to a confirmation page
        console.log('Account deactivated successfully');
      })
      .catch((error) => {
        // Handle error, e.g., show an error message
        console.error('Error deactivating account:', error);
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
  class="bg-surface-100-800-token flex w-full flex-col items-start gap-y-4 rounded-lg border border-red-600 p-4"
>
  <h1 class="h1">Danger Zone</h1>
  <Button variant="destructive" class="w-full" onclick={() => (deactivateDialogOpen = true)}>
    Deactivate Account
  </Button>
</div>
