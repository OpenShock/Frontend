<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { signalr_state } from '$lib/signalr/connection';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import SecondLevelSidebar from './SecondLevelSidebar.svelte';
  import type { RouteCategory } from './Route';

  $: path = $page.url.pathname;

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
</script>

{#if $UserSelfStore && $signalr_state === HubConnectionState.Connected}
  <div class="flex flex-row h-full">
    <AppRail>
      <svelte:fragment slot="lead">
        <AppRailAnchor href="/home" selected={path === '/home'} title="Home" hover="transition ease-in-out bg-primary-hover-token">
          <i slot="lead" class="fa fa-house text-2xl"></i>
          <span>Home</span>
        </AppRailAnchor>
        <AppRailAnchor
          href="/shockers"
          selected={path === '/shockers'}
          title="Shockers"
        >
          <i slot="lead" class="fa fa-bolt text-2xl"></i>
          <span>Shockers</span>
        </AppRailAnchor>
        <AppRailAnchor href="/hubs" selected={path === '/hubs'} title="Hubs" hover="transition ease-in-out bg-primary-hover-token">
          <i slot="lead" class="fa fa-microchip text-2xl"></i>
          <span>Hubs</span>
        </AppRailAnchor>
        <AppRailAnchor
          href="/sharelinks"
          selected={path === '/sharelinks'}
          title="Sharelinks"
          hover="transition ease-in-out bg-primary-hover-token"
        >
          <i slot="lead" class="fa fa-link text-2xl"></i>
          <span>Sharelinks</span>
        </AppRailAnchor>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        {#if $UserSelfStore.rank === RankType.admin}
          <AppRailAnchor href="/admin" selected={path === '/admin' || path.startsWith('/admin/')} title="Admin" hover="transition ease-in-out bg-primary-hover-token">
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
