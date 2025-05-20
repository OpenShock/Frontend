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

  let currentUser = $derived($UserStore.self);

  let sidebarContext = Sidebar.useSidebar();
  let path = $derived(page.url.pathname);

  interface Entry {
    title: string;
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

  let generalGroup = $derived.by<Group>(() => {
    const isAuthenticated = !!currentUser;

    let menus: Menu[] = [
      {
        title: 'Home',
        Icon: House,
        href: isAuthenticated ? '/home' : '/',
      },
    ];

    if (isAuthenticated) {
      menus = menus.concat([
        {
          title: 'Shockers',
          Icon: Zap,
          href: '/shockers',
        },
        {
          title: 'Hubs',
          Icon: Router,
          href: '/hubs',
        },
        {
          title: 'Shares',
          Icon: Link,
          href: '/shares',
        },
      ]);
    }

    menus.push({
      title: 'Flashtool',
      Icon: Cpu,
      href: '/flashtool',
    });

    return {
      title: 'General',
      menus,
    };
  });
  const adminGroup: Group = {
    title: 'Admin',
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
  };
  const settingsGroup: Group = {
    title: 'Settings',
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
  };

  let headerGroups = $derived([generalGroup]);
  let footerGroups = $derived.by(() => {
    const isAuthenticated = !!currentUser;

    let groups: Group[] = [];

    if (isAuthenticated) {
      if (currentUser.roles.includes(RoleType.Admin)) {
        groups.push(adminGroup);
      }

      groups.push(settingsGroup);
    }

    return groups;
  });

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
        {@render menuSubItemSection(subItem)}
      {/each}
    </Sidebar.MenuSub>
  {/if}
{/snippet}

{#snippet groupContentSection(group: Group)}
  <Sidebar.GroupContent>
    <Sidebar.Menu>
      {#each group.menus as menu (menu.title)}
        {@render menuSection(menu)}
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
{/snippet}

{#snippet groupsSection(groups: Group[])}
  {#each groups as group (group.title)}
    {#if group.collapsible === undefined}
      <Sidebar.Group>
        <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
        {@render groupContentSection(group)}
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
            {@render groupContentSection(group)}
          </Collapsible.Content>
        </Sidebar.Group>
      </Collapsible.Root>
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
    {@render groupsSection(headerGroups)}
    <div class="grow-1"></div>
    {@render groupsSection(footerGroups)}
  </Sidebar.Content>
  <Sidebar.Footer></Sidebar.Footer>
</Sidebar.Root>
