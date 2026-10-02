<script lang="ts">
  import type { AdminUserViewHub } from '#lib/api/index.js';
  import Cpu from '@lucide/svelte/icons/cpu';
  import Zap from '@lucide/svelte/icons/zap';
  import { EmptyState } from '@openshock/svelte-core/components';
  import * as Card from '@openshock/svelte-core/components/ui/card';

  interface Props {
    hubs: AdminUserViewHub[];
  }

  let { hubs }: Props = $props();

  let shockerCount = $derived(hubs.reduce((sum, hub) => sum + hub.shockers.length, 0));

  const shortDate = (instant: Temporal.Instant) =>
    instant.toLocaleString(undefined, { dateStyle: 'short' });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Hubs ({hubs.length})</Card.Title>
    <Card.Description>
      {shockerCount} shocker{shockerCount === 1 ? '' : 's'} across this account's hubs.
    </Card.Description>
  </Card.Header>
  <Card.Content class="flex flex-col gap-3">
    {#if hubs.length === 0}
      <EmptyState compact icon={Cpu} title="No hubs" />
    {:else}
      {#each hubs as hub (hub.id)}
        <div class="rounded-md border">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
            <Cpu class="text-muted-foreground size-4 shrink-0" />
            <span class="min-w-0 flex-1 truncate font-medium">{hub.name}</span>
            <span class="text-muted-foreground font-mono text-xs">{hub.id}</span>
            <span class="text-muted-foreground text-sm" title={hub.createdAt.toString()}>
              Created {shortDate(hub.createdAt)}
            </span>
          </div>
          {#if hub.shockers.length > 0}
            <div class="divide-y border-t">
              {#each hub.shockers as shocker (shocker.id)}
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 pr-4 pl-10">
                  <Zap class="text-muted-foreground size-3.5 shrink-0" />
                  <span class="min-w-0 flex-1 truncate text-sm">{shocker.name}</span>
                  <span class="text-muted-foreground font-mono text-xs">{shocker.id}</span>
                  <span class="text-muted-foreground text-xs" title={shocker.createdAt.toString()}>
                    Created {shortDate(shocker.createdAt)}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </Card.Content>
</Card.Root>
