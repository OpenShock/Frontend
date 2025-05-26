<script lang="ts">
  import { adminApi } from '$lib/api';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { ValidationResult } from '$lib/types/ValidationResult';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onAdded: () => void;
  }

  let { open = $bindable<boolean>(), onAdded }: Props = $props();

  let name = $state('');
  let url = $state('');
  let urlValidationResult = $derived.by<ValidationResult>(() => {
    if (url.length == 0) return { valid: true };

    // Step 1: Check if URL is a non-empty string
    if (url.trim() === '') {
      return {
        valid: false,
        message: 'URL must be a non-empty string',
      };
    }

    // Step 2: Define a regular expression for Discord webhook URLs
    const discordWebhookRegex =
      /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;

    // Step 3: Test the URL against the regex
    if (!discordWebhookRegex.test(url)) {
      return {
        valid: false,
        message: 'Not a valid Discord webhook URL',
      };
    }

    // Step 4: If all checks pass, the URL is valid
    return {
      valid: true,
    };
  });

  let valid = $derived(name.length > 0 && url.length > 0 && urlValidationResult.valid);

  function createWebhook() {
    adminApi
      .adminAddWebhook({ name, url })
      .then(() => {
        onAdded();
        toast.success('Created webhook');
        open = false;
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add webhook</Dialog.Title>
      <Dialog.Description>
        <strong>We currently only support discord webhooks, womp womp.</strong>
      </Dialog.Description>
    </Dialog.Header>
    <TextInput label="Name" bind:value={name} />
    <TextInput label="Url" bind:value={url} validationResult={urlValidationResult} />
    <Button onclick={createWebhook} disabled={!valid}>Create</Button>
  </Dialog.Content>
</Dialog.Root>
