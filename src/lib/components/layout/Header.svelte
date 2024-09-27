<script lang="ts">
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { AppBar, LightSwitch, popup, type PopupSettings } from '@skeletonlabs/skeleton';

  const accountPopup: PopupSettings = {
    event: 'click',
    target: 'accountPopup',
    placement: 'bottom-end',
  };
</script>

<AppBar>
  <div slot="lead" class="flex items-center space-x-4">
    <!-- Logo -->
    <a
      href={!!$UserSelfStore ? '/home' : '/'}
      class="overflow-hidden lg:!ml-0 lg:w-auto select-none"
      data-sveltekit-preload-data="hover"
      aria-label="OpenShock"
    >
      <img class="inline-block h-12 pointer-events-none" src="/logo.svg" alt="OpenShock Logo" />
    </a>
  </div>
  <svelte:fragment slot="trail">
    <LightSwitch />
    {#if !!$UserSelfStore}
      <div
        class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        use:popup={accountPopup}
      >
        <img class="inline-block h-8 rounded-full" src={$UserSelfStore.avatar} alt="User Avatar" />
        <p class="hidden lg:inline-block">{$UserSelfStore.name}</p>
      </div>
      <div class="card p-4 w-48 bg-surface-200-700-token shadow-xl" data-popup="accountPopup">
        <a
          href="/profile"
          class="block text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Profile
        </a>
        <a
          href="/settings"
          class="block text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Settings
        </a>
        <a
          href="/logout"
          class="block text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Logout
        </a>
        <div class="arrow bg-surface-200-700-token" data-arrow="accountPopup"></div>
      </div>
    {:else}
      <a
        href="/login"
        class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Login
      </a>
      <a
        href="/signup"
        class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Sign Up
      </a>
      <div>
        <a href={PUBLIC_GITHUB_PROJECT_URL} class="btn-icon" aria-label="GitHub">
          <i class="fa-brands fa-github text-lg"></i>
        </a>
        <a href={PUBLIC_DISCORD_INVITE_URL} class="btn-icon" aria-label="Discord">
          <i class="fa-brands fa-discord text-lg"></i>
        </a>
      </div>
    {/if}
  </svelte:fragment>
</AppBar>
