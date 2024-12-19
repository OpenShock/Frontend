<script lang="ts">
  import { page } from '$app/state';
  import { RankType } from '$lib/api/internal/v1';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { Collapsible } from 'bits-ui';

  import {
    ChevronDown,
    Cpu,
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
    currentUserRank: RankType;
  }

  let { currentUserRank }: Props = $props();

  let path = $derived(page.url.pathname);

  type subItem = {
    name: string;
    class?: string;
    href?: string;
    target?: string;
  };

  type Menu = {
    name: string;
    icon: typeof Cpu;
    class?: string;
    href?: string;
    target?: string;
    collapsible?: { open: boolean };
    subItems?: subItem[];
  };

  type Group = {
    title: string;
    ranks?: RankType[];
    collapsible?: { open: boolean };
    menus: Menu[];
  };

  const groups: Group[] = [
    {
      title: 'General',
      menus: [
        {
          name: 'Home',
          icon: House,
          href: '/home',
        },
        {
          name: 'Shockers',
          icon: Zap,
          href: '/shockers',
        },
        {
          name: 'Hubs',
          icon: Cpu,
          href: '/hubs',
        },
        {
          name: 'Sharelinks',
          icon: Link,
          href: '/sharelinks',
        },
      ],
    },
  ];

  const footerGroups: Group[] = [
    {
      title: 'Admin',
      ranks: [RankType.Admin, RankType.System],
      collapsible: { open: false },
      menus: [
        {
          name: 'Monitoring',
          icon: SquareActivity,
          subItems: [
            {
              name: 'Online Hubs',
              href: '/admin/online-hubs',
            },
          ],
        },
        {
          name: 'Management',
          icon: Wrench,
          subItems: [
            {
              name: 'Users',
              href: '/admin/users',
            },
          ],
        },
        {
          name: 'Hangfire',
          icon: Timer,
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
          icon: UserPen,
          href: '/settings/account',
        },
        {
          name: 'Sessions',
          icon: MonitorSmartphone,
          href: '/settings/sessions',
        },
        {
          name: 'API Tokens',
          icon: KeyRound,
          href: '/settings/api-tokens',
        },
        {
          name: 'Danger Zone',
          icon: TriangleAlert,
          class: '!text-red-500',
          collapsible: { open: false },
          href: '/settings/danger-zone',
        },
      ],
    },
  ];

  function meetsReq(rank: RankType, group: Group) {
    return group.ranks?.includes(rank) ?? true;
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
          <menu.icon />
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

{#snippet groupsSection(userRank: RankType, groups: Group[])}
  {#each groups as group (group.title)}
    {#if meetsReq(userRank, group)}
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
    {@render groupsSection(currentUserRank, groups)}
  </Sidebar.Content>
  <Sidebar.Footer>
    {@render groupsSection(currentUserRank, footerGroups)}
  </Sidebar.Footer>
</Sidebar.Root>
