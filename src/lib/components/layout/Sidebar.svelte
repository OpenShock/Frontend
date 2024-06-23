<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { signalr_state } from '$lib/signalr/connection';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import path from 'path';

  const settingsPaths = [
    {
      name: 'Account',
      path: '/settings/account',
    },
    {
      name: 'API Tokens',
      path: '/settings/api-tokens',
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

{#if $page.url.pathname.startsWith('/settings')}

    <section
      class="p-4 space-y-4 overflow-x-y-auto text-nowrap bg-surface-100-800-token border-l border-surface-400-500-token min-w-[270px]"
    >
      <p class="font-bold text-2xl">General</p>
      <nav class="list-nav">
        <ul>
          {#each settingsPaths as { name, path }}
            <li>
              <a href={path} class={$page.url.pathname === path ? 'bg-primary-active-token' : ''}>
                {name}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
      <p class="font-bold text-2xl text-red-500">Danger Zone</p>
      <nav class="list-nav">
        <ul>
          <li>
            <a
              href="/settings/delete-account"
              class={$page.url.pathname === '/settings/delete-account'
                ? 'bg-primary-active-token'
                : ''}
            >
              Delete Account
            </a>
          </li>
        </ul>
      </nav>
    </section>
    {/if}
  </div>
{/if}
