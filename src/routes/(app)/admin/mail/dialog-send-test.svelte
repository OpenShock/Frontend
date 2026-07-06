<script lang="ts">
  import { EmailType, adminSendTestEmail } from '$lib/api';
  import { TextInput } from '@openshock/svelte-core/components/input/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog/index.js';
  import * as Select from '@openshock/svelte-core/components/ui/select/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { ValidationResult } from '@openshock/svelte-core/types/ValidationResult.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    onSent?: () => void;
  }

  let { open = $bindable<boolean>(), onSent }: Props = $props();

  const typeLabels: Record<EmailType, string> = {
    [EmailType.AccountActivation]: 'Account activation',
    [EmailType.PasswordReset]: 'Password reset',
    [EmailType.EmailVerification]: 'Email verification',
    [EmailType.EmailChangeNotice]: 'Email change notice',
  };

  const typeOptions = Object.values(EmailType).map((type) => ({
    value: type,
    label: typeLabels[type],
  }));

  let type = $state<EmailType>(EmailType.PasswordReset);
  let recipient = $state('');

  // Same shape check the signup/change-email forms use client-side: a single @ with something either side.
  let recipientValidation = $derived.by<ValidationResult>(() => {
    if (recipient.length === 0) return { valid: true };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return { valid: false, message: 'Not a valid email address' };
    }
    return { valid: true };
  });

  let triggerLabel = $derived(typeOptions.find((o) => o.value === type)?.label ?? 'Email type');
  let valid = $derived(recipient.length > 0 && recipientValidation.valid);
  let submitting = $state(false);

  function onSubmit() {
    submitting = true;
    adminSendTestEmail({ body: { type, recipient } })
      .then(() => {
        toast.success('Test email enqueued');
        onSent?.();
        open = false;
      })
      .catch(handleApiError)
      .finally(() => (submitting = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Send test email</Dialog.Title>
      <Dialog.Description>
        Enqueues a preview of the chosen template to the given address. It is delivered through the
        normal pipeline with a dummy link — it touches no account and mints no token.
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-4">
      <div class="grid gap-2">
        <span class="text-sm font-medium">Template</span>
        <Select.Root type="single" bind:value={type}>
          <Select.Trigger>{triggerLabel}</Select.Trigger>
          <Select.Content>
            {#each typeOptions as option (option.value)}
              <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <TextInput
        type="email"
        label="Recipient"
        bind:value={recipient}
        validationResult={recipientValidation}
      />
    </div>

    <Button onclick={onSubmit} disabled={!valid || submitting}>Send</Button>
  </Dialog.Content>
</Dialog.Root>
