<script lang="ts">
  import { Link, Router, Share2, Zap } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import Container from '$lib/components/Container.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import { onlineHubs, ownHubs, refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { onMount } from 'svelte';

  registerBreadcrumbs(() => [{ label: 'Home', href: '/home' }]);

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

<div class="flex w-full flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold">
      Welcome back{userState.self ? `, ${userState.self.name}` : ''}
    </h1>
    <p class="text-muted-foreground mt-1">Here's an overview of your OpenShock setup.</p>
  </div>

  <!-- Stats cards -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between pb-2">
        <Card.Title class="text-sm font-medium">Shockers</Card.Title>
        <Zap class="text-muted-foreground size-4" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{shockerCount}</div>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between pb-2">
        <Card.Title class="text-sm font-medium">Hubs</Card.Title>
        <Router class="text-muted-foreground size-4" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{hubCount}</div>
        <p class="text-muted-foreground text-xs">
          {onlineHubCount} online
        </p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between pb-2">
        <Card.Title class="text-sm font-medium">Hub Status</Card.Title>
        <div
          class={onlineHubCount > 0
            ? 'size-2 rounded-full bg-green-500'
            : 'size-2 rounded-full bg-red-500'}
        ></div>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">
          {#if hubCount === 0}
            No hubs
          {:else if onlineHubCount === hubCount}
            All online
          {:else if onlineHubCount === 0}
            All offline
          {:else}
            {onlineHubCount}/{hubCount} online
          {/if}
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Quick links -->
  <div>
    <h2 class="mb-3 text-lg font-semibold">Quick Links</h2>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Button
        variant="outline"
        class="h-auto justify-start gap-3 p-4"
        href={resolve('/shockers/own')}
      >
        <Zap class="size-5" />
        <div class="text-left">
          <div class="font-medium">My Shockers</div>
          <div class="text-muted-foreground text-xs">Control your shockers</div>
        </div>
      </Button>
      <Button variant="outline" class="h-auto justify-start gap-3 p-4" href={resolve('/hubs')}>
        <Router class="size-5" />
        <div class="text-left">
          <div class="font-medium">Hubs</div>
          <div class="text-muted-foreground text-xs">Manage your devices</div>
        </div>
      </Button>
      <Button
        variant="outline"
        class="h-auto justify-start gap-3 p-4"
        href={resolve('/shockers/shared')}
      >
        <Share2 class="size-5" />
        <div class="text-left">
          <div class="font-medium">Shared Shockers</div>
          <div class="text-muted-foreground text-xs">Shockers shared with you</div>
        </div>
      </Button>
      <Button
        variant="outline"
        class="h-auto justify-start gap-3 p-4"
        href={resolve('/shares/public')}
      >
        <Link class="size-5" />
        <div class="text-left">
          <div class="font-medium">Public Shares</div>
          <div class="text-muted-foreground text-xs">Manage share links</div>
        </div>
      </Button>
    </div>
  </div>

  <!-- Getting started hint if no hubs/shockers -->
  {#if hubCount === 0}
    <Card.Root class="border-dashed">
      <Card.Header>
        <Card.Title>Get Started</Card.Title>
        <Card.Description>
          You don't have any hubs yet. Create a hub to connect your first device, then add shockers
          to it.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button href={resolve('/hubs')}>
          <Router class="size-4" />
          Set Up a Hub
        </Button>
      </Card.Footer>
    </Card.Root>
  {:else if shockerCount === 0}
    <Card.Root class="border-dashed">
      <Card.Header>
        <Card.Title>Add Your First Shocker</Card.Title>
        <Card.Description>
          You have {hubCount} hub{hubCount > 1 ? 's' : ''} set up. Add a shocker to start controlling
          your devices.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button href={resolve('/shockers/own')}>
          <Zap class="size-4" />
          Go to Shockers
        </Button>
      </Card.Footer>
    </Card.Root>
  {/if}
</div>
