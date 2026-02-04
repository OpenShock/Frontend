<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import {
    ColorScheme,
    colorScheme,
    getDarkReaderState,
  } from '$lib/stores/ColorSchemeStore.svelte';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  let pendingScheme = $state<ColorScheme | null>(null);
  function handleOpenChanged(open: boolean) {
    if (open) return;
    pendingScheme = null;
  }
  function confirm() {
    if (!pendingScheme) return;
    colorScheme.Value = pendingScheme;
    pendingScheme = null;
  }

  // Decision matrix
  //        light  dark system pending
  //  light false false  false
  //   dark true  false  check
  // system check false  false
  // current
  function isGoingNuclear(current: ColorScheme, pending: ColorScheme) {
    // There will definetly be no transition from dark -> light
    if (current === pending || current === ColorScheme.Light || pending === ColorScheme.Dark)
      return false;

    const currentDark = current === ColorScheme.Dark;
    const pendingLight = pending === ColorScheme.Light;
    if (currentDark && pendingLight) return true; // Change will definetly go from dark to light

    // Now either current or pending is system, so we need to query the browser preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      // System prefers lightmode, if the current mode is dark the transition will happen
      return currentDark;
    }

    // system prefers darkmode, if pending is light then the transition will happen
    return pendingLight;
  }
  function evaluateLightSwitch(scheme: ColorScheme) {
    if (isGoingNuclear(colorScheme.Value, scheme)) {
      const darkreader = getDarkReaderState();
      if (darkreader.isActive) {
        toast.warning('DarkReader is enabled, activating light mode will have no effect!');
        return;
      }
      pendingScheme = scheme;
      return;
    }
    colorScheme.Value = scheme;
  }
</script>

<Dialog.Root bind:open={() => pendingScheme !== null, handleOpenChanged}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Switch to light mode</Dialog.Title>
      <Dialog.Description>
        <span class="font-bold text-red-500">Warning:</span> You are about to switch to light mode.
        <br />
        Are you sure you want to do this?
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={confirm}>I am willing to take the risk</Button>
  </Dialog.Content>
</Dialog.Root>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={cn(buttonVariants({ variant: 'ghost' }), 'size-8! text-gray-600 dark:text-gray-300')}
  >
    <Sun class="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
    <Moon
      class="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
    />
    <span class="sr-only">Toggle theme</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    {#each Object.values(ColorScheme) as value}
      <DropdownMenu.Item
        class="cursor-pointer capitalize"
        onclick={() => evaluateLightSwitch(value)}>{value}</DropdownMenu.Item
      >
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
