<script lang="ts">
  import PanelLeft from '@lucide/svelte/icons/panel-left';
  import { goto } from '$app/navigation';
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import LightSwitch from '$lib/components/LightSwitch.svelte';
  import DiscordIcon from '$lib/components/svg/DiscordIcon.svelte';
  import GithubIcon from '$lib/components/svg/GithubIcon.svelte';
  import * as Breadcrumb from '$lib/components/ui/breadcrumb';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { useSidebar } from '$lib/components/ui/sidebar';
  import { BreadCrumbStore } from '$lib/stores/BreadCrumbStore';
  import { UserStore } from '$lib/stores/UserStore';
  import { cn } from '$lib/utils';

  let sidebar = useSidebar();
</script>

{#snippet dropdownItem(name: string, url: string)}
  <DropdownMenu.Item class="cursor-pointer" onclick={() => goto(url)}>
    {name}
  </DropdownMenu.Item>
{/snippet}
{#snippet headerItem(text: string, href: string)}
  <Button {href}>{text}</Button>
{/snippet}

<header
  class="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-12 w-full flex-row items-center border-b px-2 backdrop-blur-sm"
>
  <Button variant="ghost" class="size-8" onclick={() => sidebar.toggle()}>
    <PanelLeft size={24} class="m-0 text-gray-600 dark:text-gray-300" />
  </Button>
  {#if $BreadCrumbStore.length > 0}
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {#each $BreadCrumbStore as crumb, index}
          <Breadcrumb.Item>
            {#if index < $BreadCrumbStore.length - 1}
              <Breadcrumb.Link href={crumb.href} class="text-gray-600 dark:text-gray-300">
                {crumb.text}
              </Breadcrumb.Link>
              <Breadcrumb.Separator class="text-gray-600 dark:text-gray-300" />
            {:else}
              <Breadcrumb.Page class="text-gray-900 dark:text-gray-100">
                {crumb.text}
              </Breadcrumb.Page>
            {/if}
          </Breadcrumb.Item>
        {/each}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  {/if}
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
        <a href={PUBLIC_GITHUB_PROJECT_URL} class="p-2" aria-label="GitHub">
          <GithubIcon class="size-6 fill-black dark:fill-white" />
        </a>
        <a href={PUBLIC_DISCORD_INVITE_URL} class="p-2" aria-label="Discord">
          <DiscordIcon class="size-6 fill-black dark:fill-white" />
        </a>
      </div>
    {/if}
  </div>
</header>
