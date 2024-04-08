<script lang="ts">
  import { UserSelfStore } from '$lib/stores/UserStore';
  import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';
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
      <a
        href="/account"
        class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <img class="inline-block h-8 rounded-full" src={$UserSelfStore.avatar} alt="User Avatar" />
        <p class="hidden lg:inline-block">{$UserSelfStore.name}</p>
      </a>
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
