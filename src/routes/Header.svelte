<script lang="ts">
  import PanelLeft from '@lucide/svelte/icons/panel-left';
  import { goto } from '$app/navigation';
  import type { Path } from '$app/types';
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$app/env/public';
  import { LightSwitch } from '@openshock/svelte-core/components';
  import { DiscordLogo, GithubIcon } from '@openshock/svelte-core/components/svg';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { Separator } from '@openshock/svelte-core/components/ui/separator';
  import { useSidebar } from '@openshock/svelte-core/components/ui/sidebar';
  import { userState } from '#lib/state/user-state.svelte.js';
  import { cn } from '@openshock/svelte-core/utils';
  import Breadcrumb from './Breadcrumb.svelte';
  import { prefixBase } from '#lib/utils/url.js';
  import { resolve } from '$app/paths';
  import { LogIn, UserPlus } from '@lucide/svelte';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';

  let sidebar = useSidebar();
</script>

{#snippet dropdownItem(name: string, url: Path)}
  <!-- prefixBase is used here because resolve() can't take a union-typed pathname -->
  <DropdownMenu.Item class="cursor-pointer" onclick={() => goto(prefixBase(url))}>
    {name}
  </DropdownMenu.Item>
{/snippet}

<header class="flex h-12 shrink-0 items-center gap-2 border-b">
  <div class="flex w-full items-center gap-2 px-3">
    <Button variant="ghost" class="size-8" title="Toggle Sidebar" onclick={() => sidebar.toggle()}>
      <PanelLeft size={24} class="text-muted-foreground m-0" />
    </Button>
    <Separator orientation="vertical" class="mr-2 data-vertical:h-4 data-vertical:self-center" />
    <Breadcrumb />
    <div
      class={cn(
        'flex flex-1 flex-row items-center justify-between space-x-2 py-2',
        userState.self !== null ? 'pr-2' : 'px-2'
      )}
    >
      <div class="flex-1"></div>

      <LightSwitch />

      {#if userState.loading}
        <Spinner class="text-muted-foreground size-8" />
      {:else if userState.self}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            class="text-muted-foreground hover:text-foreground cursor-pointer select-none"
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
              {@render dropdownItem('Profile', 'profile')}
              {@render dropdownItem('Settings', 'settings/account')}
              {@render dropdownItem('Logout', 'logout')}
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {:else}
        <Button variant="outline" href={resolve('login')}>Login <LogIn /></Button>
        <Button variant="outline" href={resolve('signup')}>Sign Up <UserPlus /></Button>
        <div class="hidden sm:flex sm:flex-row">
          <a href={PUBLIC_GITHUB_PROJECT_URL} class="p-2" title="Project GitHub">
            <GithubIcon class="fill-foreground size-6" />
          </a>
          <a href={PUBLIC_DISCORD_INVITE_URL} class="p-2" title="Community Discord">
            <DiscordLogo class="fill-foreground size-6" />
          </a>
        </div>
      {/if}
    </div>
  </div>
</header>
