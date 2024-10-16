<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { signalr_state } from '$lib/signalr/connection';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import SecondLevelSidebar from './SecondLevelSidebar.svelte';
  import type { RouteCategory } from './Route';
  import type { ApiUserSelf } from '$lib/types/ApiUser';

  $: path = $page.url.pathname;

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

  function meetsReq(user: ApiUserSelf, route: Route) {
    return !route.requirement || route.requirement(user);
  }
  function isPathMatch(path: string, href: string) {
    return path === href || path.startsWith(href + '/');
  }
</script>

{#if $UserSelfStore && $signalr_state === HubConnectionState.Connected}
  <div class="flex flex-row h-full">
    <AppRail>
      <svelte:fragment slot="lead">
        {#each leadRoutes as route (route.href)}
          {#if meetsReq($UserSelfStore, route)}
            <AppRailAnchor
              href={route.href}
              selected={isPathMatch(path, route.href)}
              title={route.name}
              hover="transition ease-in-out bg-primary-hover-token"
            >
              <i slot="lead" class="fa {route.icon} text-2xl"></i>
              <span>{route.name}</span>
            </AppRailAnchor>
          {/if}
        {/each}
      </svelte:fragment>
      <svelte:fragment slot="trail">
        {#each trailRoutes as route (route.href)}
          {#if meetsReq($UserSelfStore, route)}
            <AppRailAnchor
              href={route.href}
              selected={isPathMatch(path, route.href)}
              title={route.name}
              hover="transition ease-in-out bg-primary-hover-token"
            >
              <i slot="lead" class="fa {route.icon} text-2xl"></i>
              <span>{route.name}</span>
            </AppRailAnchor>
          {/if}
        {/each}
      </svelte:fragment>
    </AppRail>

    <SecondLevelSidebar baseRoute="/settings" routes={settingsRoutes} />

    <SecondLevelSidebar baseRoute="/admin" routes={adminRoutes} />
  </div>
{/if}
