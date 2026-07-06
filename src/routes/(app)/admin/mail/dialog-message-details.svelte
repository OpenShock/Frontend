<script lang="ts">
  import type { EmailOutboxMessageDto } from '$lib/api';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog/index.js';
  import { Temporal } from 'temporal-polyfill';

  interface Props {
    open: boolean;
    message: EmailOutboxMessageDto;
  }

  let { open = $bindable<boolean>(), message }: Props = $props();

  const fmt = (i: Temporal.Instant | null) => (i ? i.toLocaleString() : '—');

  let rows = $derived([
    { label: 'ID', value: message.id },
    { label: 'Type', value: message.type },
    { label: 'Status', value: message.status },
    { label: 'Recipient', value: message.recipient },
    { label: 'Recipient name', value: message.recipientName ?? '—' },
    { label: 'Attempts', value: message.attemptCount.toString() },
    { label: 'Coalesce key', value: message.coalesceKey ?? '—' },
    { label: 'Created at', value: fmt(message.createdAt) },
    { label: 'Next attempt at', value: fmt(message.nextAttemptAt) },
    { label: 'Sent at', value: fmt(message.sentAt) },
    { label: 'Failed at', value: fmt(message.failedAt) },
  ]);

  let payloadEntries = $derived(Object.entries(message.payload));
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
    <Dialog.Header>
      <Dialog.Title>Message details</Dialog.Title>
      <Dialog.Description>Outbox message {message.id}</Dialog.Description>
    </Dialog.Header>

    <dl class="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
      {#each rows as row (row.label)}
        <dt class="text-muted-foreground font-medium">{row.label}</dt>
        <dd class="break-all font-mono">{row.value}</dd>
      {/each}
    </dl>

    <div class="mt-2">
      <h4 class="mb-1 text-sm font-medium">Payload</h4>
      {#if payloadEntries.length === 0}
        <p class="text-muted-foreground text-sm">No payload</p>
      {:else}
        <dl class="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1 text-sm">
          {#each payloadEntries as [key, value] (key)}
            <dt class="text-muted-foreground font-mono">{key}</dt>
            <dd class="break-all font-mono">{value}</dd>
          {/each}
        </dl>
      {/if}
    </div>

    <div class="mt-2">
      <h4 class="mb-1 text-sm font-medium">Last error</h4>
      {#if message.lastError}
        <pre
          class="bg-muted max-h-48 overflow-auto rounded p-2 text-xs whitespace-pre-wrap">{message.lastError}</pre>
      {:else}
        <p class="text-muted-foreground text-sm">None</p>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
