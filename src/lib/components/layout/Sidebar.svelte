<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
</script>

{#if $UserSelfStore}
  <AppRail>
    <svelte:fragment slot="lead">
      <AppRailAnchor href="/home" selected={$page.url.pathname === '/home'} title="Home">
        <i slot="lead" class="fa fa-house fa-2xl py-4" />
        <span>Home</span>
      </AppRailAnchor>
      <AppRailAnchor
        href="/shockers"
        selected={$page.url.pathname === '/shockers'}
        title="Shockers"
      >
        <i slot="lead" class="fa fa-bolt fa-2xl py-4" />
        <span>Shockers</span>
      </AppRailAnchor>
      <AppRailAnchor href="/devices" selected={$page.url.pathname === '/devices'} title="Devices">
        <i slot="lead" class="fa fa-microchip fa-2xl py-4" />
        <span>Devices</span>
      </AppRailAnchor>
      <AppRailAnchor
        href="/sharelinks"
        selected={$page.url.pathname === '/sharelinks'}
        title="Sharelinks"
      >
        <i slot="lead" class="fa fa-link fa-2xl py-4" />
        <span>Sharelinks</span>
      </AppRailAnchor>
    </svelte:fragment>
    <svelte:fragment slot="trail">
      <AppRailAnchor href="/tokens" selected={$page.url.pathname === '/tokens'} title="Tokens">
        <i slot="lead" class="fa fa-key fa-2xl py-4" />
        <span>Tokens</span>
      </AppRailAnchor>
      <AppRailAnchor href="/account" selected={$page.url.pathname === '/account'} title="Account">
        <i slot="lead" class="fa fa-user fa-2xl py-4" />
        <span>Account</span>
      </AppRailAnchor>
      {#if $UserSelfStore.rank === RankType.admin}
        <AppRailAnchor href="/admin" selected={$page.url.pathname === '/admin'} title="Admin">
          <i slot="lead" class="fa fa-user-shield fa-2xl py-4" />
          <span>Admin</span>
        </AppRailAnchor>
      {/if}
    </svelte:fragment>
  </AppRail>
{/if}
