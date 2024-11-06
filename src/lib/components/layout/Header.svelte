<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import { UserStore } from '$lib/stores/UserStore';
  import LightSwitch from '$lib/components/LightSwitch.svelte';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import * as Menubar from '$lib/components/ui/menubar';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
</script>

{#snippet item(text: string, href: string)}
  <Button {href}>{text}</Button>
{/snippet}

{#snippet brand(name: string, icon: `fa-${string}`, href: string)}
  <a {href} class="p-2" aria-label={name}>
    <i class="fa-brands {icon} text-lg"></i>
  </a>
{/snippet}

<header class="px-4 py-2 flex items-center justify-between space-x-2">
  <div class="flex items-center space-x-4">
    <a
      href={!!$UserStore.self ? '/home' : '/'}
      class="overflow-hidden lg:!ml-0 lg:w-auto select-none"
      data-sveltekit-preload-data="hover"
      aria-label="OpenShock"
    >
      <img class="inline-block h-12 pointer-events-none" src="/logo.svg" alt="OpenShock Logo" />
    </a>
  </div>

  <div class="flex-1"></div>

  <LightSwitch />

  {#if $UserStore.self !== null}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer select-none">
        <img class="inline-block h-8 rounded-full" src={$UserStore.self.avatar} alt="User Avatar" />
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
</header>
