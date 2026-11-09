<script lang="ts">
  import {
    ChevronDown,
    House,
    IdCard,
    KeyRound,
    Link,
    MonitorSmartphone,
    Router,
    ScrollText,
    Settings,
    Share2,
    SquareActivity,
    SquareTerminalIcon,
    Timer,
    Users,
    Wrench,
    Zap,
  } from '@lucide/svelte';
  import { PUBLIC_HANGFIRE_URL } from '$app/env/public';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { Path } from '$app/types';
  import { RoleType } from '#lib/api/index.js';
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
  } from '@openshock/svelte-core/components/ui/sidebar';
  import { userState } from '#lib/state/user-state.svelte.js';
  import type { AnyComponent } from '@openshock/svelte-core/types';
  import { isSerialSupported } from '#lib/utils/compatibility.js';
  import { Collapsible } from 'bits-ui';
  import { prefixBase } from '#lib/utils/url.js';
  import LogoMark from '#lib/components/svg/LogoMark.svelte';
  import LogoText from '#lib/components/svg/LogoText.svelte';
  import { m } from '#lib/paraglide/messages.js';

  let currentUser = $derived(userState.self);

  let sidebarContext = useSidebar();
  let path = $derived(page.url.pathname);

  interface Entry {
    title: string;
  }
  interface Item extends Entry {
    class?: string;
    href?: Path;
    target?: string;
  }

  interface Menu extends Item {
    Icon: AnyComponent;
    /** Fully-qualified URL to an external site. Rendered verbatim (no base prefix, opened as a plain link). */
    externalHref?: string;
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
        title: m.sidebar_home(),
        Icon: House,
        href: isAuthenticated ? 'home' : '',
      },
    ];

    if (isAuthenticated) {
      menus.push(
        { title: m.sidebar_shockers(), Icon: Zap, href: 'shockers/own' },
        {
          title: m.sidebar_shared_shockers(),
          Icon: Share2,
          href: 'shockers/shared',
        },
        {
          title: m.sidebar_hubs(),
          Icon: Router,
          href: 'hubs',
        },
        {
          title: m.sidebar_user_shares(),
          Icon: Users,
          href: 'shares/user',
        },
        {
          title: m.sidebar_public_shares(),
          Icon: Link,
          href: 'shares/public',
        }
      );
    }

    // Only time we dont show the menu is if its on a mobile device without serial support
    if (!(!isSerialSupported && sidebarContext.isMobile)) {
      menus.push({
        title: m.sidebar_serial_terminal(),
        Icon: SquareTerminalIcon,
        href: 'terminal',
      });
    }

    return {
      title: m.sidebar_group_general(),
      menus,
    };
  });
  const adminGroup: Group = {
    title: m.sidebar_group_admin(),
    collapsible: { open: false },
    menus: [
      {
        title: m.sidebar_admin_monitoring(),
        Icon: SquareActivity,
        subItems: [
          {
            title: m.sidebar_admin_online_hubs(),
            href: 'admin/online-hubs',
          },
          {
            title: m.sidebar_admin_online_gateways(),
            href: 'admin/online-gateways',
          },
        ],
      },
      {
        title: m.sidebar_admin_management(),
        Icon: Wrench,
        subItems: [
          {
            title: m.sidebar_admin_users(),
            href: 'admin/users',
          },
          {
            title: m.sidebar_admin_blacklists(),
            href: 'admin/blacklists',
          },
          {
            title: m.sidebar_admin_webhooks(),
            href: 'admin/webhooks',
          },
          {
            title: m.sidebar_admin_mail(),
            href: 'admin/mail',
          },
          {
            title: m.sidebar_admin_automation_tokens(),
            href: 'admin/automation-tokens',
          },
          {
            title: m.sidebar_admin_configuration(),
            href: 'admin/config',
          },
        ],
      },
      // Hangfire lives on a separate deployment; only surface it when its URL is configured.
      ...(PUBLIC_HANGFIRE_URL
        ? [
            {
              title: m.sidebar_admin_hangfire(),
              Icon: Timer,
              externalHref: PUBLIC_HANGFIRE_URL,
              target: '_blank',
            } satisfies Menu,
          ]
        : []),
    ],
  };
  const settingsGroup: Group = {
    title: m.sidebar_group_settings(),
    menus: [
      {
        title: m.sidebar_settings_api_tokens(),
        Icon: KeyRound,
        href: 'settings/api-tokens',
      },
      {
        title: m.sidebar_settings_sessions(),
        Icon: MonitorSmartphone,
        href: 'settings/sessions',
      },
      {
        title: m.sidebar_settings_audit_log(),
        Icon: ScrollText,
        href: 'settings/audit-log',
      },
      {
        title: m.sidebar_settings_connections(),
        Icon: IdCard,
        href: 'settings/connections',
      },
      {
        title: m.sidebar_settings_account(),
        Icon: Settings,
        href: 'settings/account',
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
    return href !== undefined && (path === href || path.startsWith(href + '/'));
  }
</script>

{#snippet menuSubItemSection(subItem: Item)}
  {@const href = subItem.href === undefined ? undefined : prefixBase(subItem.href)}
  <MenuSubButton class={subItem.class} isActive={isPathMatch(path, href)} {href}>
    {subItem.title}
  </MenuSubButton>
{/snippet}

{#snippet menuSection(menu: Menu)}
  {@const href = menu.href === undefined ? undefined : prefixBase(menu.href)}
  <MenuItem>
    <MenuButton class={menu.class} isActive={isPathMatch(path, href)}>
      {#snippet child({ props })}
        <!-- External links are rendered verbatim; internal ones get the base prefix. -->
        <!-- prefixBase is used here because resolve() can't take a union-typed pathname -->
        <!-- eslint-disable svelte/no-navigation-without-resolve -->
        <a
          href={menu.externalHref ?? href}
          target={menu.target}
          rel={menu.externalHref ? 'noopener noreferrer' : undefined}
          {...props}
        >
          <menu.Icon />
          <span>{menu.title}</span>
        </a>
        <!-- eslint-enable svelte/no-navigation-without-resolve -->
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
    <a href={currentUser ? resolve('home') : resolve('')} aria-label={m.sidebar_home_link_label()}>
      <span class="pointer-events-none flex">
        <LogoMark class="ml-[0.667px] h-7.5 shrink-0" />

        <span class="ml-1.5 flex grow items-center">
          <LogoText
            class="h-auto max-h-7.5 transition-opacity delay-100 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0"
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
  <Footer />
</Root>
