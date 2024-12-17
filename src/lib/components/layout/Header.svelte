<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import LightSwitch from '$lib/components/LightSwitch.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { useSidebar } from '$lib/components/ui/sidebar';
  import { UserStore } from '$lib/stores/UserStore';

  import Menu from 'lucide-svelte/icons/menu';

  let sidebar = useSidebar();
</script>

{#snippet item(text: string, href: string)}
  <Button {href}>{text}</Button>
{/snippet}

{#snippet brand(name: string, icon: `fa-${string}`, href: string)}
  <a {href} class="p-2" aria-label={name}>
    <i class="fa-brands {icon} text-lg"></i>
  </a>
{/snippet}

<header
  class="sticky top-0 z-50 flex w-full flex-row border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  {#if $UserStore.self}
    <button
      onclick={() => {
        sidebar.toggle();
      }}
    >
      <Menu size={32} class="mr-2 p-0 text-gray-500 sm:m-3" />
    </button>
  {/if}
  <div class="flex flex-1 flex-row items-center justify-between space-x-2 py-2 pr-4">
    <div class="flex items-center space-x-4">
      <a
        href={$UserStore.self ? '/home' : '/'}
        class="select-none overflow-hidden lg:!ml-0 lg:w-auto"
        data-sveltekit-preload-data="hover"
        aria-label="OpenShock"
      >
        <img
          class="pointer-events-none inline-block h-6 sm:h-10"
          src="/logo.svg"
          alt="OpenShock Logo"
        />
      </a>
    </div>

    <div class="flex-1"></div>

    <LightSwitch />

    {#if $UserStore.self}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class="cursor-pointer select-none text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
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
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
            <DropdownMenu.Item>Settings</DropdownMenu.Item>
            <DropdownMenu.Item>Logout</DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {:else}
      {@render item('Login', '/login')}
      {@render item('Sign Up', '/signup')}
      <div>
        {@render brand('GitHub', 'fa-github', PUBLIC_GITHUB_PROJECT_URL)}
        {@render brand('Discord', 'fa-discord', PUBLIC_DISCORD_INVITE_URL)}
      </div>
    {/if}
  </div>
</header>
