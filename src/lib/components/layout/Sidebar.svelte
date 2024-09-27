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
          href: '/settings/account',
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
</script>

{#if $UserSelfStore && $signalr_state === HubConnectionState.Connected}
  <div class="flex flex-row h-full">
    <AppRail>
      <svelte:fragment slot="lead">
        <AppRailAnchor href="/home" selected={$page.url.pathname === '/home'} title="Home">
          <i slot="lead" class="fa fa-house text-2xl"></i>
          <span>Home</span>
        </AppRailAnchor>
        <AppRailAnchor
          href="/shockers"
          selected={$page.url.pathname === '/shockers'}
          title="Shockers"
        >
          <i slot="lead" class="fa fa-bolt text-2xl"></i>
          <span>Shockers</span>
        </AppRailAnchor>
        <AppRailAnchor href="/hubs" selected={$page.url.pathname === '/devices'} title="Hubs">
          <i slot="lead" class="fa fa-microchip text-2xl"></i>
          <span>Hubs</span>
        </AppRailAnchor>
        <AppRailAnchor
          href="/sharelinks"
          selected={$page.url.pathname === '/sharelinks'}
          title="Sharelinks"
        >
          <i slot="lead" class="fa fa-link text-2xl"></i>
          <span>Sharelinks</span>
        </AppRailAnchor>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        {#if $UserSelfStore.rank === RankType.admin}
          <AppRailAnchor href="/admin" selected={$page.url.pathname === '/admin'} title="Admin">
            <i slot="lead" class="fa fa-user-shield text-2xl"></i>
            <span>Admin</span>
          </AppRailAnchor>
        {/if}
      </svelte:fragment>
    </AppRail>

    <SecondLevelSidebar baseRoute="/settings" routes={settingsRoutes} />

    <SecondLevelSidebar baseRoute="/admin" routes={adminRoutes} />
  </div>
{/if}
