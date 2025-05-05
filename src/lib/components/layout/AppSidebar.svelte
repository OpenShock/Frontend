<script lang="ts">
  import { page } from '$app/state';
  import { RoleType } from '$lib/api/internal/v1';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import { Collapsible } from 'bits-ui';
  import { UserStore } from '$lib/stores/UserStore';

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
    Cpu,
  } from '@lucide/svelte';
  import type { ApiUserSelf } from '$lib/types/ApiUser';

  let currentUser = $derived($UserStore.self);

  let sidebarContext = Sidebar.useSidebar();
  let path = $derived(page.url.pathname);

  interface Entry {
    title: string;
    auth?: true | RoleType[];
  }

  interface Item extends Entry {
    class?: string;
    href?: string;
    target?: string;
  }

  interface Menu extends Item {
    Icon: AnyComponent;
    collapsible?: { open: boolean };
    subItems?: Item[];
  }

  interface Group extends Entry {
    collapsible?: { open: boolean };
    menus: Menu[];
  }

  const groups: Group[] = [
    {
      title: 'General',
      menus: [
        {
          title: 'Home',
          auth: true,
          Icon: House,
          href: '/home',
        },
        {
          title: 'Shockers',
          auth: true,
          Icon: Zap,
          href: '/shockers',
        },
        {
          title: 'Hubs',
          auth: true,
          Icon: Router,
          href: '/hubs',
        },
        {
          title: 'Shares',
          auth: true,
          Icon: Link,
          href: '/shares',
        },
        {
          title: 'Flashtool',
          Icon: Cpu,
          href: '/flashtool',
        },
      ],
    },
  ];

  const footerGroups: Group[] = [
    {
      title: 'Admin',
      auth: [RoleType.Admin, RoleType.System],
      collapsible: { open: false },
      menus: [
        {
          title: 'Monitoring',
          Icon: SquareActivity,
          subItems: [
            {
              title: 'Online Hubs',
              href: '/admin/online-hubs',
            },
          ],
        },
        {
          title: 'Management',
          Icon: Wrench,
          subItems: [
            {
              title: 'Users',
              href: '/admin/users',
            },
          ],
        },
        {
          title: 'Hangfire',
          Icon: Timer,
          href: '/hangfire',
          target: '_blank',
        },
      ],
    },
    {
      title: 'Settings',
      auth: true,
      menus: [
        {
          title: 'Account',
          Icon: UserPen,
          href: '/settings/account',
        },
        {
          title: 'Sessions',
          Icon: MonitorSmartphone,
          href: '/settings/sessions',
        },
        {
          title: 'API Tokens',
          Icon: KeyRound,
          href: '/settings/api-tokens',
        },
        {
          title: 'Danger Zone',
          Icon: TriangleAlert,
          class: 'text-red-500!',
          href: '/settings/danger-zone',
        },
      ],
    },
  ];

  function meetsReq(currentUser: ApiUserSelf | null, entry: Entry) {
    if (!entry.auth) return true;
    if (currentUser === null) return false;
    if (entry.auth === true) return true;

    return entry.auth.some((role) => currentUser.roles.includes(role));
  }
  function isPathMatch(path: string, href?: string) {
    return path === href || path.startsWith(href + '/');
  }
</script>

{#snippet menuSubItemSection(subItem: Item)}
  <Sidebar.MenuSubButton class={subItem.class}>
    <a href={subItem.href}>
      <span> {subItem.title}</span>
    </a>
  </Sidebar.MenuSubButton>
{/snippet}

{#snippet menuSection(menu: Menu)}
  <Sidebar.MenuItem>
    <Sidebar.MenuButton class={menu.class} isActive={isPathMatch(path, menu.href)}>
      {#snippet child({ props })}
        <a href={menu.href} {...props}>
          <menu.Icon />
          <span>{menu.title}</span>
        </a>
      {/snippet}
      {#snippet tooltipContent()}
        {menu.title}
      {/snippet}
    </Sidebar.MenuButton>
    <!--
    <Sidebar.MenuAction>
    </Sidebar.MenuAction>
    -->
  </Sidebar.MenuItem>
  {#if menu.subItems}
    <Sidebar.MenuSub>
      {#each menu.subItems as subItem (subItem.title)}
        {#if meetsReq(currentUser, subItem)}
          {@render menuSubItemSection(subItem)}
        {/if}
      {/each}
    </Sidebar.MenuSub>
  {/if}
{/snippet}

{#snippet groupContentSection(currentUser: ApiUserSelf | null, group: Group)}
  <Sidebar.GroupContent>
    <Sidebar.Menu>
      {#each group.menus as menu (menu.title)}
        {#if meetsReq(currentUser, menu)}
          {@render menuSection(menu)}
        {/if}
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
{/snippet}

{#snippet groupsSection(currentUser: ApiUserSelf | null, groups: Group[])}
  {#each groups as group (group.title)}
    {#if meetsReq(currentUser, group)}
      {#if group.collapsible === undefined}
        <Sidebar.Group>
          <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
          {@render groupContentSection(currentUser, group)}
        </Sidebar.Group>
      {:else}
        <Collapsible.Root
          open={group.collapsible.open ||
            (sidebarContext.state === 'collapsed' && !sidebarContext.isMobile)}
          class="group/collapsible"
        >
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
              {@render groupContentSection(currentUser, group)}
            </Collapsible.Content>
          </Sidebar.Group>
        </Collapsible.Root>
      {/if}
    {/if}
  {/each}
{/snippet}
<!-- group-data-[collapsible=icon]:opacity-0 -->
<Sidebar.Root collapsible="icon">
  <Sidebar.Header>
    <a href={$UserStore.self ? '/home' : '/'}>
      <span class="pointer-events-none flex">
        <img class="ml-[0.667px] h-7.5" src="/IconSpinning.svg" alt="OpenShock Logo" />
        <span class="ml-1.5 grow">
          <img
            class="h-7.5 transition-opacity delay-100 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0"
            src="/LogoTextOnly.svg"
            alt="OpenShock Logo"
          />
        </span>
      </span>
    </a>
  </Sidebar.Header>
  <Sidebar.Content>
    {@render groupsSection(currentUser, groups)}
    <div class="grow-1"></div>
    {@render groupsSection(currentUser, footerGroups)}
  </Sidebar.Content>
  <Sidebar.Footer></Sidebar.Footer>
</Sidebar.Root>
