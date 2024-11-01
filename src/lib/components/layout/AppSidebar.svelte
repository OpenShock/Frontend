<script lang="ts">
  import { page } from '$app/stores';
  import { RankType } from '$lib/api/internal/v1';
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { RouteCategory } from './Route';

  interface Props {
    currentUserRank: RankType;
  }

  let { currentUserRank }: Props = $props();

  let path = $derived($page.url.pathname);

  type SubRoute = {
    name: string;
    href?: string;
    target?: string;
  };

  type Route = {
    name: string;
    icon: `fa-${string}`;
    color?: string;
    href?: string;
    target?: string;
    subRoutes?: SubRoute[]
  };

  type Menu = {
    routes: Route[];
  };

  type Group = {
    title: string;
    ranks?: RankType[];
    menus: Menu[];
  };

  const groups: Group[] = [
    {
      title: 'General',
      routes: [
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
        }
      ]
    },
    {
      title: 'Settings',
      routes: [
        {
          name: 'Account',
          icon: 'fa-eye',
          href: '/settings/account',
        },
        {
          name: 'Sessions',
          icon: 'fa-eye',
          href: '/settings/sessions',
        },
        {
          name: 'API Tokens',
          icon: 'fa-eye',
          href: '/settings/api-tokens',
        },
        {
          name: 'Danger Zone',
          icon: 'fa-triangle-exclamation',
          color: 'red-500',
          subRoutes: [
            {
              name: 'Delete Account',
              href: '/settings/delete-account',
            }
          ]
        }
      ]
    },
    {
      title: 'Admin',
      ranks: [RankType.admin, RankType.system],
      routes: [
        {
          name: 'Monitoring',
          icon: 'fa-eye',
          subRoutes: [
            {
              name: 'Online Hubs',
              href: '/admin/online-hubs',
            }
          ]
        },
        {
          name: 'Management',
          icon: 'fa-wrench',
          subRoutes: [
            {
              name: 'Users',
              href: '/admin/users',
            }
          ]
        },
        {
          name: 'Hangfire',
          icon: 'fa-circle-h',
          href: '/hangfire',
          target: '_blank'
        }
      ]
    }
  ];

  function meetsReq(rank: RankType, group: Group) {
    return group.ranks === undefined || rank in group.ranks;
  }
  function isPathMatch(path: string, href: string) {
    return path === href || path.startsWith(href + '/');
  }
</script>

{#snippet subRouteSection(subroute: SubRoute)}
  <Sidebar.MenuSubButton>
    <a href={subroute.href}>
      <span> {subroute.name}</span>
    </a>
  </Sidebar.MenuSubButton>
{/snippet}

{#snippet routeSection(route: Route)}
  <Sidebar.MenuItem>
    <Sidebar.MenuButton>
      {#snippet child({ props })}
        <a href={route.href} {...props}>
          <span><i class={"fa " + route.icon}></i> {route.name}</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
  {#if route.subRoutes}
    <Sidebar.MenuSub>
      {#each route.subRoutes as subroute (subroute.name)}
        {@render subRouteSection(subroute)}
      {/each}
    </Sidebar.MenuSub>
  {/if}
{/snippet}

{#snippet groupSection(group: Group)}
  <Sidebar.Group>
    <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        {#each group.routes as route (route.name)}
          {@render routeSection(route)}
        {/each}
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
{/snippet}

<Sidebar.Root>
  <Sidebar.Content>
    {#each groups as group (group.title)}
      {#if meetsReq(currentUserRank, group)}
        {@render groupSection(group)}
      {/if}
    {/each}
  </Sidebar.Content>
</Sidebar.Root>
