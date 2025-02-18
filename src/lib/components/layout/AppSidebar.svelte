<script lang="ts">
  import { page } from '$app/state';
  import { RoleType } from '$lib/api/internal/v1';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import { Collapsible } from 'bits-ui';

  import {
    ChevronDown,
    Router,
    House,
    KeyRound,
    Link,
    MonitorSmartphone,
    SquareActivity,
    Timer,
    TriangleAlert,
    UserPen,
    Wrench,
    Zap,
  } from 'lucide-svelte';

  interface Props {
    currentUserRoles: RoleType[];
  }

  let { currentUserRoles }: Props = $props();

  let path = $derived(page.url.pathname);

  type subItem = {
    name: string;
    class?: string;
    href?: string;
    target?: string;
  };

  type Menu = {
    name: string;
    Icon: AnyComponent;
    class?: string;
    href?: string;
    target?: string;
    collapsible?: { open: boolean };
    subItems?: subItem[];
  };

  type Group = {
    title: string;
    roles?: RoleType[];
    collapsible?: { open: boolean };
    menus: Menu[];
  };

  const groups: Group[] = [
    {
      title: 'General',
      menus: [
        {
          name: 'Home',
          Icon: House,
          href: '/home',
        },
        {
          name: 'Shockers',
          Icon: Zap,
          href: '/shockers',
        },
        {
          name: 'Hubs',
          Icon: Router,
          href: '/hubs',
        },
        {
          name: 'Sharelinks',
          Icon: Link,
          href: '/sharelinks',
        },
      ],
    },
  ];

  const footerGroups: Group[] = [
    {
      title: 'Admin',
      roles: [RoleType.Admin, RoleType.System],
      collapsible: { open: false },
      menus: [
        {
          name: 'Monitoring',
          Icon: SquareActivity,
          subItems: [
            {
              name: 'Online Hubs',
              href: '/admin/online-hubs',
            },
          ],
        },
        {
          name: 'Management',
          Icon: Wrench,
          subItems: [
            {
              name: 'Users',
              href: '/admin/users',
            },
          ],
        },
        {
          name: 'Hangfire',
          Icon: Timer,
          href: '/hangfire',
          target: '_blank',
        },
      ],
    },
    {
      title: 'Settings',
      collapsible: { open: false },
      menus: [
        {
          name: 'Account',
          Icon: UserPen,
          href: '/settings/account',
        },
        {
          name: 'Sessions',
          Icon: MonitorSmartphone,
          href: '/settings/sessions',
        },
        {
          name: 'API Tokens',
          Icon: KeyRound,
          href: '/settings/api-tokens',
        },
        {
          name: 'Danger Zone',
          Icon: TriangleAlert,
          class: '!text-red-500',
          collapsible: { open: false },
          href: '/settings/danger-zone',
        },
      ],
    },
  ];

  function meetsReq(roles: RoleType[], group: Group) {
    return group.roles?.some((role) => roles.includes(role)) ?? true;
  }
  function isPathMatch(path: string, href: string) {
    return path === href || path.startsWith(href + '/');
  }
</script>

{#snippet menuSubItemSection(subItem: subItem)}
  <Sidebar.MenuSubButton class={subItem.class}>
    <a href={subItem.href}>
      <span> {subItem.name}</span>
    </a>
  </Sidebar.MenuSubButton>
{/snippet}

{#snippet menuSection(menu: Menu)}
  <Sidebar.MenuItem>
    <Sidebar.MenuButton class={menu.class}>
      {#snippet child({ props })}
        <a href={menu.href} {...props}>
          <menu.Icon />
          <span>{menu.name}</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
    <!--
    <Sidebar.MenuAction>
    </Sidebar.MenuAction>
    -->
  </Sidebar.MenuItem>
  {#if menu.subItems}
    <Sidebar.MenuSub>
      {#each menu.subItems as subItem (subItem.name)}
        {@render menuSubItemSection(subItem)}
      {/each}
    </Sidebar.MenuSub>
  {/if}
{/snippet}

{#snippet groupContentSection(group: Group)}
  <Sidebar.GroupContent>
    <Sidebar.Menu>
      {#each group.menus as menu (menu.name)}
        {@render menuSection(menu)}
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
{/snippet}

{#snippet groupsSection(userRoles: RoleType[], groups: Group[])}
  {#each groups as group (group.title)}
    {#if meetsReq(userRoles, group)}
      {#if group.collapsible === undefined}
        <Sidebar.Group>
          <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
          {@render groupContentSection(group)}
        </Sidebar.Group>
      {:else}
        <Collapsible.Root open={group.collapsible.open} class="group/collapsible">
          <Sidebar.Group>
            <Sidebar.GroupLabel>
              {#snippet child({ props })}
                <Collapsible.Trigger {...props}>
                  {group.title}
                  <ChevronDown
                    class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                  />
                </Collapsible.Trigger>
              {/snippet}
            </Sidebar.GroupLabel>
            <Collapsible.Content>
              {@render groupContentSection(group)}
            </Collapsible.Content>
          </Sidebar.Group>
        </Collapsible.Root>
      {/if}
    {/if}
  {/each}
{/snippet}

<Sidebar.Root>
  <!--
  <Sidebar.Header>
  </Sidebar.Header>
  -->
  <Sidebar.Content>
    {@render groupsSection(currentUserRoles, groups)}
  </Sidebar.Content>
  <Sidebar.Footer>
    {@render groupsSection(currentUserRoles, footerGroups)}
  </Sidebar.Footer>
</Sidebar.Root>
