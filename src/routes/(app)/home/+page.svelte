<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Link, Router, Share2, Zap } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { Container, PageHeader } from '@openshock/svelte-core/components';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { userState } from '#lib/state/user-state.svelte.js';
  import { onlineHubs, ownHubs, refreshOwnHubs } from '#lib/state/hubs-state.svelte.js';
  import { onMount } from 'svelte';

  registerBreadcrumbs(() => [{ label: m.home_breadcrumb(), href: 'home' }]);

  let shockerCount = $derived(ownHubs.values().reduce((sum, hub) => sum + hub.shockers.length, 0));
  let hubCount = $derived(ownHubs.size);
  let onlineHubCount = $derived(
    onlineHubs
      .values()
      .filter((state) => state.isOnline)
      .toArray().length
  );

  onMount(refreshOwnHubs);
</script>

<Container>
  <div class="flex w-full flex-col gap-6">
    <PageHeader
      title={userState.self ? m.home_welcome_name({ name: userState.self.name }) : m.home_welcome()}
      subtitle={m.home_subtitle()}
      class="mb-0"
    />

    <!-- Stats cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card.Root>
        <Card.Header class="flex flex-row items-center justify-between pb-2">
          <Card.Title class="text-sm font-medium">{m.shockers_title()}</Card.Title>
          <Zap class="text-muted-foreground size-4" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{shockerCount}</div>
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Header class="flex flex-row items-center justify-between pb-2">
          <Card.Title class="text-sm font-medium">{m.hubs_title()}</Card.Title>
          <Router class="text-muted-foreground size-4" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{hubCount}</div>
          <p class="text-muted-foreground text-xs">
            {m.home_hubs_online({ count: onlineHubCount })}
          </p>
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Header class="flex flex-row items-center justify-between pb-2">
          <Card.Title class="text-sm font-medium">{m.home_hub_status()}</Card.Title>
          <div
            class={onlineHubCount > 0
              ? 'bg-success size-2 rounded-full'
              : 'bg-destructive size-2 rounded-full'}
          ></div>
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">
            {#if hubCount === 0}
              {m.home_no_hubs()}
            {:else if onlineHubCount === hubCount}
              {m.home_all_online()}
            {:else if onlineHubCount === 0}
              {m.home_all_offline()}
            {:else}
              {m.home_some_online({ online: onlineHubCount, total: hubCount })}
            {/if}
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Quick links -->
    <div>
      <h2 class="mb-3 text-lg font-semibold">{m.home_quick_links()}</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Button
          variant="outline"
          class="h-auto justify-start gap-3 p-4"
          href={resolve('shockers/own')}
        >
          <Zap class="size-5" />
          <div class="text-left">
            <div class="font-medium">{m.home_my_shockers()}</div>
            <div class="text-muted-foreground text-xs">{m.home_my_shockers_desc()}</div>
          </div>
        </Button>

        <Button variant="outline" class="h-auto justify-start gap-3 p-4" href={resolve('hubs')}>
          <Router class="size-5" />
          <div class="text-left">
            <div class="font-medium">{m.hubs_title()}</div>
            <div class="text-muted-foreground text-xs">{m.home_hubs_desc()}</div>
          </div>
        </Button>
        <Button
          variant="outline"
          class="h-auto justify-start gap-3 p-4"
          href={resolve('shockers/shared')}
        >
          <Share2 class="size-5" />
          <div class="text-left">
            <div class="font-medium">{m.shared_shockers_title()}</div>
            <div class="text-muted-foreground text-xs">{m.home_shared_desc()}</div>
          </div>
        </Button>
        <Button
          variant="outline"
          class="h-auto justify-start gap-3 p-4"
          href={resolve('shares/public')}
        >
          <Link class="size-5" />
          <div class="text-left">
            <div class="font-medium">{m.sidebar_public_shares()}</div>
            <div class="text-muted-foreground text-xs">{m.home_public_desc()}</div>
          </div>
        </Button>
      </div>
    </div>

    <!-- Getting started hint if no hubs/shockers -->
    {#if hubCount === 0}
      <Card.Root class="border-dashed">
        <Card.Header>
          <Card.Title>{m.home_get_started()}</Card.Title>
          <Card.Description>
            {m.home_get_started_desc()}
          </Card.Description>
        </Card.Header>

        <Card.Footer
          ><Button href={resolve('hubs')}><Router class="size-4" />{m.home_set_up_hub()}</Button
          ></Card.Footer
        >
      </Card.Root>
    {:else if shockerCount === 0}
      <Card.Root class="border-dashed">
        <Card.Header>
          <Card.Title>{m.home_first_shocker()}</Card.Title>
          <Card.Description>
            {m.home_first_shocker_desc({ count: hubCount })}
          </Card.Description>
        </Card.Header>

        <Card.Footer
          ><Button href={resolve('shockers/own')}
            ><Zap class="size-4" />{m.home_go_to_shockers()}</Button
          ></Card.Footer
        >
      </Card.Root>
    {/if}
  </div>
</Container>
