<script lang="ts">
  import { page } from '$app/stores';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
</script>

<AppRail>
  <svelte:fragment slot="lead">
    <AppRailAnchor href="/home" selected={$page.url.pathname === '/home'}>
      <i class="fa fa-house fa-2xl" />
    </AppRailAnchor>
    <AppRailAnchor href="/shockers" selected={$page.url.pathname === '/shockers'}>
      <i class="fa fa-bolt fa-2xl" />
    </AppRailAnchor>
    <AppRailAnchor href="/devices" selected={$page.url.pathname === '/devices'}>
      <i class="fa fa-microchip fa-2xl" />
    </AppRailAnchor>
    <AppRailAnchor href="/sharelinks" selected={$page.url.pathname === '/sharelinks'}>
      <i class="fa fa-link fa-2xl" />
    </AppRailAnchor>
  </svelte:fragment>
  <svelte:fragment slot="trail">
    <AppRailAnchor href="/tokens" selected={$page.url.pathname === '/tokens'}>
      <i class="fa fa-key fa-2xl" />
    </AppRailAnchor>
    <AppRailAnchor href="/account" selected={$page.url.pathname === '/account'}>
      <i class="fa fa-user fa-2xl" />
    </AppRailAnchor>
    <AppRailAnchor href="/admin" selected={$page.url.pathname === '/admin'}>
      <i class="fa fa-user-shield fa-2xl" />
    </AppRailAnchor>
  </svelte:fragment>
</AppRail>
