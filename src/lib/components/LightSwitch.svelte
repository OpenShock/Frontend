<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte';
  import AbsolutelySureButton from '$lib/components/AbsolutelySureButton.svelte';
  import { buttonVariants } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { ColorSchemeStore, LightMode, getDarkReaderState } from '$lib/stores/ColorSchemeStore';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  let pendingScheme = $state<LightMode | undefined>();
  function handleOpenChanged(open: boolean) {
    if (open) return;
    pendingScheme = undefined;
  }
  function confirm() {
    if (!pendingScheme) return;
    ColorSchemeStore.set(pendingScheme);
    pendingScheme = undefined;
  }

  // Decision matrix
  //        light  dark system pending
  //  light false false  false
  //   dark true  false  check
  // system check false  false
  // current
  function isGoingNuclear(current: LightMode, pending: LightMode) {
    // There will definetly be no transition from dark -> light
    if (current === pending || current === LightMode.Light || pending === LightMode.Dark)
      return false;

    const currentDark = current === LightMode.Dark;
    const pendingLight = pending === LightMode.Light;
    if (currentDark && pendingLight) return true; // Change will definetly go from dark to light

    // Now either current or pending is system, so we need to query the browser preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      // System prefers lightmode, if the current mode is dark the transition will happen
      return currentDark;
    }

    // system prefers darkmode, if pending is light then the transition will happen
    return pendingLight;
  }
  function evaluateLightSwitch(scheme: LightMode) {
    if (isGoingNuclear($ColorSchemeStore, scheme)) {
      const darkreader = getDarkReaderState();
      if (darkreader.isActive) {
        toast.warning('DarkReader is enabled, activating light mode will have no effect!');
        return;
      }
      pendingScheme = scheme;
      return;
    }
    ColorSchemeStore.set(scheme);
  }
</script>

<Dialog.Root bind:open={() => pendingScheme !== undefined, handleOpenChanged}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Switch to light mode</Dialog.Title>
      <Dialog.Description>
        <span class="font-bold text-red-500">Warning:</span> You are about to switch to light mode.
        <br />
        Are you sure you want to do this?
      </Dialog.Description>
    </Dialog.Header>
    <AbsolutelySureButton text="I am willing to take the risk" onconfirm={confirm} />
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
    {#each Object.values(LightMode) as value}
      <DropdownMenu.Item
        class="cursor-pointer capitalize"
        onclick={() => evaluateLightSwitch(value)}>{value}</DropdownMenu.Item
      >
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
