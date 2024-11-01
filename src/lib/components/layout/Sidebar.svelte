<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import type { RouteCategory } from './Route';

  interface Props {
    currentUserRank: RankType;
  }

  let { currentUserRank }: Props = $props();

  let path = $derived($page.url.pathname);

  type Route = {
    name: string;
    icon: `fa-${string}`;
    href: string;
    ranks?: RankType[];
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
      ranks: [RankType.admin, RankType.system],
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

  function meetsReq(rank: RankType, route: Route) {
    return route.ranks === undefined || rank in route.ranks;
  }
  function isPathMatch(path: string, href: string) {
    return path === href || path.startsWith(href + '/');
  }
</script>

{#snippet items(routes: Route[])}
  {#each routes as route (route.href)}
    {#if meetsReq(currentUserRank, route)}
      <AppRailAnchor
        href={route.href}
        selected={isPathMatch(path, route.href)}
        title={route.name}
        hover="transition ease-in-out bg-primary-hover-token"
      >
        {#snippet lead()}<i class="fa {route.icon} text-2xl"></i>{/snippet}
        <span>{route.name}</span>
      </AppRailAnchor>
    {/if}
  {/each}
{/snippet}

{#snippet nestedSidebar(baseRoute: string, routes: RouteCategory[])}
  {#if $page.url.pathname.startsWith(baseRoute)}
    <section
      class="p-4 space-y-4 overflow-x-y-auto text-nowrap bg-surface-100-800-token border-l border-surface-400-500-token min-w-[270px]"
    >
      {#each routes as category}
        <p class="font-bold text-2xl {category.headerClass}">{category.name}</p>
        <nav class="list-nav">
          <ul>
            {#each category.routes as route}
              <li>
                <a
                  href={route.href}
                  target={route.target}
                  class={'transition ease-in-out ' +
                    ($page.url.pathname === route.href ? 'bg-primary-active-token' : '')}
                >
                  {route.name}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      {/each}
    </section>
  {/if}
{/snippet}

<sidebar class="flex flex-row h-full">
  <AppRail>
    {#snippet lead()}{@render items(leadRoutes)}{/snippet}
    {#snippet trail()}{@render items(trailRoutes)}{/snippet}
  </AppRail>
  {@render nestedSidebar('/settings', settingsRoutes)}
  {@render nestedSidebar('/admin', adminRoutes)}
</sidebar>
