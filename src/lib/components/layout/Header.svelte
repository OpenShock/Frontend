<script lang="ts">
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
          href="/account"
          class="block text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Account
        </a>
        <a
          href="/logout"
          class="block text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Logout
        </a>
        <div class="arrow bg-surface-200-700-token" data-arrow="accountPopup" />
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
        <a href="https://github.com/OpenShock" class="btn-icon">
          <i class="fa-brands fa-github text-lg" />
        </a>
        <a href="https://discord.gg/openshock" class="btn-icon">
          <i class="fa-brands fa-discord text-lg" />
        </a>
      </div>
    {/if}
  </svelte:fragment>
</AppBar>
