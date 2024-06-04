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
      <AppRailAnchor href="/profile" selected={$page.url.pathname === '/profile'} title="Profile">
        <i slot="lead" class="fa fa-user text-2xl" />
        <span>Profile</span>
      </AppRailAnchor>
    </svelte:fragment>
  </AppRail>
{/if}
