<script lang="ts">
  import PanelLeft from '@lucide/svelte/icons/panel-left';
  import { goto } from '$app/navigation';
  import type { Pathname } from '$app/types';
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import LightSwitch from '$lib/components/LightSwitch.svelte';
  import DiscordIcon from '$lib/components/svg/DiscordIcon.svelte';
  import GithubIcon from '$lib/components/svg/GithubIcon.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { useSidebar } from '$lib/components/ui/sidebar';
  import { UserStore } from '$lib/stores/UserStore';
  import { cn } from '$lib/utils';
  import Breadcrumb from './Breadcrumb.svelte';
  import { base } from '$app/paths';
  import { unsafeResolve } from '$lib/utils/url';

  let sidebar = useSidebar();
  /* eslint-disable svelte/no-navigation-without-resolve */
</script>

{#snippet dropdownItem(name: string, url: Pathname)}
  <!-- I know this is deprecated buy resolve() is too strict to be used here... -->
  <DropdownMenu.Item class="cursor-pointer" onclick={() => goto(unsafeResolve(url))}>
    {name}
  </DropdownMenu.Item>
{/snippet}
{#snippet headerItem(text: string, href: Pathname)}
  <Button href={unsafeResolve(href)}>{text}</Button>
{/snippet}

<header
  class="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-12 w-full flex-none flex-row items-center border-b px-2 backdrop-blur-sm"
>
  <Button variant="ghost" class="size-8" title="Open Sidebar" onclick={() => sidebar.toggle()}>
    <PanelLeft size={24} class="m-0 text-gray-600 dark:text-gray-300" />
  </Button>
  <Breadcrumb />
  <div
    class={cn(
      'flex flex-1 flex-row items-center justify-between space-x-2 py-2',
      $UserStore.self !== null ? 'pr-2' : 'px-2'
    )}
  >
    <div class="flex-1"></div>

    <LightSwitch />

    {#if $UserStore.self}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class="cursor-pointer text-gray-600 select-none hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
        >
          <img
            class="inline-block h-8 rounded-full"
            src={$UserStore.self.avatar}
            alt="User Avatar"
          />
          <p class="hidden lg:inline-block">{$UserStore.self.name}</p>
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
      {@render headerItem('Login', '/login')}
      {@render headerItem('Sign Up', '/signup')}
      <div class="hidden sm:flex sm:flex-row">
        <a href={PUBLIC_GITHUB_PROJECT_URL} class="p-2" title="Project GitHub">
          <GithubIcon class="size-6 fill-black dark:fill-white" />
        </a>
        <a href={PUBLIC_DISCORD_INVITE_URL} class="p-2" title="Community Discord">
          <DiscordIcon class="size-6 fill-black dark:fill-white" />
        </a>
      </div>
    {/if}
  </div>
</header>
