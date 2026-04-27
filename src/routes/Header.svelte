<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve -- uses prefixBase for dynamic navigation and external URLs */

  import PanelLeft from '@lucide/svelte/icons/panel-left';
  import { goto } from '$app/navigation';
  import type { Pathname } from '$app/types';
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import LightSwitch from '$lib/components/LightSwitch.svelte';
  import DiscordLogo from '$lib/components/svg/DiscordLogo.svelte';
  import GithubIcon from '$lib/components/svg/GithubIcon.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Separator } from '$lib/components/ui/separator';
  import { useSidebar } from '$lib/components/ui/sidebar';
  import { userState } from '$lib/state/user-state.svelte';
  import { cn } from '$lib/utils';
  import Breadcrumb from './Breadcrumb.svelte';
  import { prefixBase } from '$lib/utils/url';
  import { resolve } from '$app/paths';
  import { LogIn, UserPlus } from '@lucide/svelte';

  let sidebar = useSidebar();
</script>

{#snippet dropdownItem(name: string, url: Pathname)}
  <!-- prefixBase is used here because resolve() requires a route ID, not a plain pathname -->
  <DropdownMenu.Item class="cursor-pointer" onclick={() => goto(prefixBase(url))}>
    {name}
  </DropdownMenu.Item>
{/snippet}

<header class="flex h-12 shrink-0 items-center gap-2 border-b">
  <div class="flex w-full items-center gap-2 px-3">
    <Button variant="ghost" class="size-8" title="Toggle Sidebar" onclick={() => sidebar.toggle()}>
      <PanelLeft size={24} class="m-0 text-gray-600 dark:text-gray-300" />
    </Button>
    <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
    <Breadcrumb />
    <div
      class={cn(
        'flex flex-1 flex-row items-center justify-between space-x-2 py-2',
        userState.self !== null ? 'pr-2' : 'px-2'
      )}
    >
      <div class="flex-1"></div>

      <LightSwitch />

      {#if userState.self}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            class="cursor-pointer text-gray-600 select-none hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
          >
            <img
              class="inline-block h-8 rounded-full"
              src={userState.self.avatar}
              alt="{userState.self.name}'s avatar"
            />
            <p class="hidden lg:inline-block">{userState.self.name}</p>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Group>
              {@render dropdownItem('Profile', '/profile')}
              {@render dropdownItem('Settings', '/settings/account')}
              {@render dropdownItem('Logout', '/logout')}
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {:else}
        <Button variant="outline" href={resolve('/login')}>Login <LogIn /></Button>
        <Button variant="outline" href={resolve('/signup')}>Sign Up <UserPlus /></Button>
        <div class="hidden sm:flex sm:flex-row">
          <a href={PUBLIC_GITHUB_PROJECT_URL} class="p-2" title="Project GitHub">
            <GithubIcon class="size-6 fill-black dark:fill-white" />
          </a>
          <a href={PUBLIC_DISCORD_INVITE_URL} class="p-2" title="Community Discord">
            <DiscordLogo class="size-6 fill-black dark:fill-white" />
          </a>
        </div>
      {/if}
    </div>
  </div>
</header>
