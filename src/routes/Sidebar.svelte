<script lang="ts">
  import {
    ChevronDown,
    Cpu,
    House,
    IdCard,
    KeyRound,
    Link,
    MonitorSmartphone,
    Router,
    Settings,
    Share2,
    SquareActivity,
    Timer,
    Users,
    Wrench,
    Zap,
  } from '@lucide/svelte';
  import { asset, resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { Pathname } from '$app/types';
  import { RoleType } from '$lib/api/internal/v1';
  import {
    Content,
    Footer,
    Group,
    GroupContent,
    GroupLabel,
    Header,
    Menu,
    MenuButton,
    MenuItem,
    MenuSub,
    MenuSubButton,
    Root,
    useSidebar,
  } from '$lib/components/ui/sidebar';
  import { UserStore } from '$lib/stores/UserStore';
  import type { AnyComponent } from '$lib/types/AnyComponent';
  import { isMobile, isSerialSupported } from '$lib/utils/compatibility';
  import { Collapsible } from 'bits-ui';

  let currentUser = $derived($UserStore.self);

  let sidebarContext = useSidebar();
  let path = $derived(page.url.pathname);

  interface Entry {
    title: string;
  }

  interface Item extends Entry {
    class?: string;
    href?: Pathname;
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
      menus.push(
        {
          title: 'Shockers',
          Icon: Zap,
          href: '/shockers/own',
        },
        {
          title: 'Shared Shockers',
          Icon: Share2,
          href: '/shockers/shared',
        },
        {
          title: 'Hubs',
          Icon: Router,
          href: '/hubs',
        },
        {
          title: 'User Shares',
          Icon: Users,
          href: '/shares/user',
        },
        {
          title: 'Public Shares',
          Icon: Link,
          href: '/shares/public',
        }
      );
    }

    // Only time we dont show the menu is if its on a mobile device without serial support
    if (!(!isSerialSupported && isMobile)) {
      menus.push({
        title: 'Flashtool',
        Icon: Cpu,
        href: '/flashtool',
      });
    }

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
          {
            title: 'Blacklists',
            href: '/admin/blacklists',
          },
          {
            title: 'Webhooks',
            href: '/admin/webhooks',
          },
          {
            title: 'Configuration',
            href: '/admin/config',
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
        title: 'API Tokens',
        Icon: KeyRound,
        href: '/settings/api-tokens',
      },
      {
        title: 'Sessions',
        Icon: MonitorSmartphone,
        href: '/settings/sessions',
      },
      {
        title: 'Connections',
        Icon: IdCard,
        href: '/settings/connections',
      },
      {
        title: 'Account Settings',
        Icon: Settings,
        href: '/settings/account',
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
  <MenuSubButton
    class={subItem.class}
    isActive={isPathMatch(path, subItem.href)}
    href={subItem.href}
  >
    {subItem.title}
  </MenuSubButton>
{/snippet}

{#snippet menuSection(menu: Menu)}
  <MenuItem>
    <MenuButton class={menu.class} isActive={isPathMatch(path, menu.href)}>
      {#snippet child({ props })}
        <a href={menu.href} {...props}>
          <menu.Icon />
          <span>{menu.title}</span>
        </a>
      {/snippet}
      {#snippet tooltipContent()}
        {menu.title}
      {/snippet}
    </MenuButton>
    <!--
    <MenuAction>
    </MenuAction>
    -->
  </MenuItem>
  {#if menu.subItems}
    <MenuSub>
      {#each menu.subItems as subItem (subItem.title)}
        {@render menuSubItemSection(subItem)}
      {/each}
    </MenuSub>
  {/if}
{/snippet}

{#snippet groupContentSection(group: Group)}
  <GroupContent>
    <Menu>
      {#each group.menus as menu (menu.title)}
        {@render menuSection(menu)}
      {/each}
    </Menu>
  </GroupContent>
{/snippet}

{#snippet groupsSection(groups: Group[])}
  {#each groups as group (group.title)}
    {#if group.collapsible === undefined}
      <Group>
        <GroupLabel>{group.title}</GroupLabel>
        {@render groupContentSection(group)}
      </Group>
    {:else}
      <Collapsible.Root
        open={group.collapsible.open ||
          (sidebarContext.state === 'collapsed' && !sidebarContext.isMobile)}
        class="group/collapsible"
      >
        <Group>
          <GroupLabel>
            {#snippet child({ props })}
              <Collapsible.Trigger {...props}>
                {group.title}
                <ChevronDown
                  class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                />
              </Collapsible.Trigger>
            {/snippet}
          </GroupLabel>
          <Collapsible.Content>
            {@render groupContentSection(group)}
          </Collapsible.Content>
        </Group>
      </Collapsible.Root>
    {/if}
  {/each}
{/snippet}
<!-- group-data-[collapsible=icon]:opacity-0 -->
<Root collapsible="icon">
  <Header>
    <a href={resolve(currentUser ? '/home' : '/')}>
      <span class="pointer-events-none flex">
        <img class="ml-[0.667px] h-7.5" src={asset('/IconSpinning.svg')} alt="OpenShock Logo" />
        <span class="ml-1.5 grow">
          <img
            class="h-7.5 transition-opacity delay-100 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0"
            src={asset('/LogoTextOnly.svg')}
            alt="OpenShock Logo"
          />
        </span>
      </span>
    </a>
  </Header>
  <Content>
    {@render groupsSection(headerGroups)}
    <div class="grow"></div>
    {@render groupsSection(footerGroups)}
  </Content>
  <Footer></Footer>
</Root>
