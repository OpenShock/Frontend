<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import { UserStore } from '$lib/stores/UserStore';
  import { LightSwitch, popup, type PopupSettings } from '@skeletonlabs/skeleton';

  const accountPopup: PopupSettings = {
    event: 'click',
    target: 'accountPopup',
    placement: 'bottom-end',
  };
</script>

{#snippet item(text: string, href: string)}
  <a
    {href}
    class="block text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
  >
    {text}
  </a>
{/snippet}

{#snippet brand(name: string, icon: `fa-${string}`, href: string)}
  <a {href} class="btn-icon" aria-label={name}>
    <i class="fa-brands {icon} text-lg"></i>
  </a>
{/snippet}

<header>
  <div class="flex items-center space-x-4">
    <!-- Logo -->
    <a
      href={!!$UserStore.self ? '/home' : '/'}
      class="overflow-hidden lg:!ml-0 lg:w-auto select-none"
      data-sveltekit-preload-data="hover"
      aria-label="OpenShock"
    >
      <img class="inline-block h-12 pointer-events-none" src="/logo.svg" alt="OpenShock Logo" />
    </a>
  </div>

  <LightSwitch />

  {#if $UserStore.self !== null}
    <div
      class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
      use:popup={accountPopup}
    >
      <img class="inline-block h-8 rounded-full" src={$UserStore.self.avatar} alt="User Avatar" />
      <p class="hidden lg:inline-block">{$UserStore.self.name}</p>
    </div>
    <div class="card p-4 w-48 bg-surface-200-700-token shadow-xl" data-popup="accountPopup">
      {@render item('Profile', '/profile')}
      {@render item('Settings', '/settings')}
      {@render item('Logout', '/logout')}
      <div class="arrow bg-surface-200-700-token" data-arrow="accountPopup"></div>
    </div>
  {:else}
    {@render item('Login', '/login')}
    {@render item('Sign Up', '/signup')}
    <div>
      {@render brand('GitHub', 'fa-github', PUBLIC_GITHUB_PROJECT_URL)}
      {@render brand('Discord', 'fa-discord', PUBLIC_DISCORD_INVITE_URL)}
    </div>
  {/if}
</header>
