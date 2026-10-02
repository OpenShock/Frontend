<script lang="ts" module>
  /**
   * The API describes `createdByIp` with .NET's reflected `IPAddress` shape — a
   * bag of `isIPv6*` flags and a deprecated numeric `address` — while the value
   * on the wire is the address as a string. Neither is worth trusting blindly,
   * so the string form is used when that is what arrives and the column falls
   * back to "unknown" otherwise.
   */
  function formatCreatedByIp(createdByIp: unknown): string | null {
    return typeof createdByIp === 'string' && createdByIp.length > 0 ? createdByIp : null;
  }
</script>

<script lang="ts">
  import type { AdminUserViewApiToken } from '#lib/api/index.js';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import { EmptyState } from '@openshock/svelte-core/components';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { formatRelativeInstantOrNull } from '#lib/utils/datetime.js';
  import { createNowTicker } from '@openshock/svelte-core/utils';
  import ApiTokenDeleteDialog from './dialog-api-token-delete.svelte';

  interface Props {
    tokens: AdminUserViewApiToken[];
    onChanged: () => void;
  }

  let { tokens, onChanged }: Props = $props();

  const clock = createNowTicker();

  let tokenToDelete = $state<AdminUserViewApiToken | null>(null);
</script>

<!-- Keyed on the row, so the dialog is mounted already open and torn down on close. -->
{#if tokenToDelete}
  <ApiTokenDeleteDialog
    bind:open={
      () => tokenToDelete !== null,
      (open) => {
        if (!open) tokenToDelete = null;
      }
    }
    token={tokenToDelete}
    onDeleted={onChanged}
  />
{/if}

<Card.Root>
  <Card.Header>
    <Card.Title>API Tokens ({tokens.length})</Card.Title>
    <Card.Description>Tokens this account can authenticate the API with.</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if tokens.length === 0}
      <EmptyState compact icon={KeyRound} title="No API tokens" />
    {:else}
      <div class="divide-y rounded-md border">
        {#each tokens as token (token.id)}
          {@const lastUsed = formatRelativeInstantOrNull(token.lastUsed, clock.current)}
          {@const expires = formatRelativeInstantOrNull(token.validUntil, clock.current)}
          {@const createdByIp = formatCreatedByIp(token.createdByIp)}
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="truncate font-medium">{token.name}</span>
              <div class="flex flex-wrap gap-1">
                {#each token.permissions as permission (permission)}
                  <Badge variant="secondary">{permission}</Badge>
                {/each}
              </div>
            </div>
            <div class="text-muted-foreground flex shrink-0 flex-col items-end gap-0.5 text-sm">
              <span title={token.createdAt.toString()}>
                Created {token.createdAt.toLocaleString(undefined, { dateStyle: 'short' })}
                {#if createdByIp}
                  from {createdByIp}
                {/if}
              </span>
              <span>
                {lastUsed ? `Last used ${lastUsed}` : 'Never used'}
                · {expires ? `expires ${expires}` : 'never expires'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="text-red-500"
              title="Delete token"
              onclick={() => (tokenToDelete = token)}
            >
              <Trash2 />
            </Button>
          </div>
        {/each}
      </div>
    {/if}
  </Card.Content>
</Card.Root>
