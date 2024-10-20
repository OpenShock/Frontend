<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { signalr_state } from '$lib/signalr/connection';
  import { UserStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import SecondLevelSidebar from './SecondLevelSidebar.svelte';
  import type { RouteCategory } from './Route';
  import type { ApiUserSelf } from '$lib/types/ApiUser';

  let path = $derived($page.url.pathname);

  type Route = {
    name: string;
    icon: `fa-${string}`;
    href: string;
    requirement?: (user: ApiUserSelf) => boolean;
  };
  const leadRoutes: Route[] = [
    {
      name: 'Home',
      icon: 'fa-house',
      href: '/home',
    },
    {
      name: 'Shockers',
      icon: 'fa-bolt',
      href: '/shockers',
    },
    {
      name: 'Hubs',
      icon: 'fa-microchip',
      href: '/hubs',
    },
    {
      name: 'Sharelinks',
      icon: 'fa-link',
      href: '/sharelinks',
    },
  ];
  const trailRoutes: Route[] = [
    {
      name: 'Admin',
      icon: 'fa-user-shield',
      href: '/admin',
      requirement: (usr) => usr.rank == RankType.admin || usr.rank == RankType.system,
    },
  ];

  const settingsRoutes: RouteCategory[] = [
    {
      name: 'General',
      routes: [
        {
          name: 'Account',
          href: '/settings/account',
        },
        {
          name: 'Sessions',
          href: '/settings/sessions',
        },
        {
          name: 'API Tokens',
          href: '/settings/api-tokens',
        },
      ],
    },
    {
      name: 'Danger Zone',
      headerClass: 'text-red-500',
      routes: [
        {
          name: 'Delete Account',
          href: '/settings/delete-account',
        },
      ],
    },
  ];

  const adminRoutes: RouteCategory[] = [
    {
      name: 'General',
      routes: [
        {
          name: 'Online Hubs',
          href: '/admin/online-hubs',
        },
        {
          name: 'Users',
          href: '/admin/users',
        },
        {
          name: 'Hangfire',
          href: '/hangfire',
          target: '_blank',
        },
      ],
    },
  ];

  function meetsReq(user: ApiUserSelf | null, route: Route) {
    if (!user) return false;

    return !route.requirement || route.requirement(user);
  }
  function isPathMatch(path: string, href: string) {
    return path === href || path.startsWith(href + '/');
  }
</script>

{#snippet item(route: Route)}
  {#if meetsReq($UserStore.self, route)}
    <AppRailAnchor
      href={route.href}
      selected={isPathMatch(path, route.href)}
      title={route.name}
      hover="transition ease-in-out bg-primary-hover-token"
    >
      {#snippet lead()}
                  <i  class="fa {route.icon} text-2xl"></i>
                {/snippet}
      <span>{route.name}</span>
    </AppRailAnchor>
  {/if}
{/snippet}

{#if $UserStore.self !== null && $signalr_state === HubConnectionState.Connected}
  <div class="flex flex-row h-full">
    <AppRail>
      {#snippet lead()}
          {#each leadRoutes as route (route.href)}
            {@render item(route)}
          {/each}
      {/snippet}
      {#snippet trail()}
        {#each trailRoutes as route (route.href)}
          {@render item(route)}
        {/each}
      {/snippet}
    </AppRail>

    <SecondLevelSidebar baseRoute="/settings" routes={settingsRoutes} />

    <SecondLevelSidebar baseRoute="/admin" routes={adminRoutes} />
  </div>
{/if}
