<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { signalr_state } from '$lib/signalr/connection';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { HubConnectionState } from '@microsoft/signalr';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
</script>

{#if $UserSelfStore && $signalr_state === HubConnectionState.Connected}
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
      <AppRailAnchor href="/tokens" selected={$page.url.pathname === '/tokens'} title="Tokens">
        <i slot="lead" class="fa fa-key text-2xl" />
        <span>Tokens</span>
      </AppRailAnchor>
      <AppRailAnchor href="/account" selected={$page.url.pathname === '/account'} title="Account">
        <i slot="lead" class="fa fa-user text-2xl" />
        <span>Account</span>
      </AppRailAnchor>
      {#if $UserSelfStore.rank === RankType.admin}
        <AppRailAnchor href="/admin" selected={$page.url.pathname === '/admin'} title="Admin">
          <i slot="lead" class="fa fa-user-shield text-2xl" />
          <span>Admin</span>
        </AppRailAnchor>
      {/if}
    </svelte:fragment>
  </AppRail>
{/if}
