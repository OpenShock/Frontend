<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { signalr_state } from '$lib/signalr/connection';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import path from 'path';
  import SecondLevelSidebar from './SecondLevelSidebar.svelte';
  import type { RouteCategory } from './Route';

  const settingsRoutes: RouteCategory[] = [
    {
      name: 'General',
      routes: [
        {
          name: 'Account',
          path: '/settings/account',
        },
        {
          name: 'API Tokens',
          path: '/settings/api-tokens',
        },
      ],
    },
    {
      name: 'Danger Zone',
      routes: [
        {
          name: 'Delete Account',
          path: '/settings/delete-account',
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
          path: '/admin/online-hubs',
        },
        {
          name: 'Users',
          path: '/admin/users',
        },
        {
          name: 'Hangfire',
          path: '/hangfire',
          external: true,
        },
      ],
    },
  ];
</script>

{#if $UserSelfStore && $signalr_state === HubConnectionState.Connected}
  <div class="flex flex-row h-full">
    <AppRail>
      <svelte:fragment slot="lead">
        <AppRailAnchor href="/home" selected={$page.url.pathname === '/home'} title="Home">
          <i slot="lead" class="fa fa-house text-2xl" />
          <span>Home</span>
        </AppRailAnchor>
        <AppRailAnchor
          href="/shockers"
          selected={$page.url.pathname === '/shockers'}
          title="Shockers"
        >
          <i slot="lead" class="fa fa-bolt text-2xl" />
          <span>Shockers</span>
        </AppRailAnchor>
        <AppRailAnchor href="/devices" selected={$page.url.pathname === '/devices'} title="Devices">
          <i slot="lead" class="fa fa-microchip text-2xl" />
          <span>Devices</span>
        </AppRailAnchor>
        <AppRailAnchor
          href="/sharelinks"
          selected={$page.url.pathname === '/sharelinks'}
          title="Sharelinks"
        >
          <i slot="lead" class="fa fa-link text-2xl" />
          <span>Sharelinks</span>
        </AppRailAnchor>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        {#if $UserSelfStore.rank === RankType.admin}
          <AppRailAnchor href="/admin" selected={$page.url.pathname === '/admin'} title="Admin">
            <i slot="lead" class="fa fa-user-shield text-2xl" />
            <span>Admin</span>
          </AppRailAnchor>
        {/if}
      </svelte:fragment>
    </AppRail>

    <SecondLevelSidebar baseRoute="/settings" routes={settingsRoutes} />

    <SecondLevelSidebar baseRoute="/admin" routes={adminRoutes} />
  </div>
{/if}
