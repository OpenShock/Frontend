<script lang="ts">
  import type {
    AdminUserViewEmailChange,
    AdminUserViewNameChange,
    AdminUserViewPasswordReset,
  } from '#lib/api/index.js';
  import AtSign from '@lucide/svelte/icons/at-sign';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import UserPen from '@lucide/svelte/icons/user-pen';
  import { EmptyState } from '@openshock/svelte-core/components';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { formatRelativeInstant } from '#lib/utils/datetime.js';
  import { createNowTicker } from '@openshock/svelte-core/utils';

  interface Props {
    nameChanges: AdminUserViewNameChange[];
    emailChanges: AdminUserViewEmailChange[];
    passwordResets: AdminUserViewPasswordReset[];
  }

  let { nameChanges, emailChanges, passwordResets }: Props = $props();

  const clock = createNowTicker();

  const when = (instant: Temporal.Instant) => formatRelativeInstant(instant, clock.current);

  // Both email changes and password resets are requests that may never have been
  // redeemed, which is the thing worth seeing at a glance.
  const usedBadge = (usedAt: Temporal.Instant | null) =>
    usedAt === null
      ? { variant: 'outline' as const, label: 'Unused' }
      : { variant: 'secondary' as const, label: `Used ${when(usedAt)}` };
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Name changes ({nameChanges.length})</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if nameChanges.length === 0}
        <EmptyState compact icon={UserPen} title="Never renamed" />
      {:else}
        <ul class="divide-y rounded-md border">
          {#each nameChanges as change (change.id)}
            <li class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
              <span class="min-w-0 truncate">
                was <span class="font-medium">{change.oldName}</span>
              </span>
              <span class="text-muted-foreground text-xs" title={change.createdAt.toString()}>
                {when(change.createdAt)}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Email changes ({emailChanges.length})</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if emailChanges.length === 0}
        <EmptyState compact icon={AtSign} title="No email changes" />
      {:else}
        <ul class="divide-y rounded-md border">
          {#each emailChanges as change (change.id)}
            {@const badge = usedBadge(change.usedAt)}
            <li class="flex flex-col gap-1 px-3 py-2 text-sm">
              <span class="truncate font-medium">{change.email}</span>
              <div class="flex flex-wrap items-center gap-2">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                <span class="text-muted-foreground text-xs" title={change.createdAt.toString()}>
                  requested {when(change.createdAt)}
                </span>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-base">Password resets ({passwordResets.length})</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if passwordResets.length === 0}
        <EmptyState compact icon={KeyRound} title="No password resets" />
      {:else}
        <ul class="divide-y rounded-md border">
          {#each passwordResets as reset (reset.id)}
            {@const badge = usedBadge(reset.usedAt)}
            <li class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              <span class="text-muted-foreground text-xs" title={reset.createdAt.toString()}>
                requested {when(reset.createdAt)}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
