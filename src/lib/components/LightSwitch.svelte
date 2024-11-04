<script lang="ts">
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';

  import { buttonVariants } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { ColorSchemeStore } from '$lib/stores/ColorSchemeStore';
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
    <Sun
      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Moon
      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item onclick={() => ColorSchemeStore.set('light')}>Light</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => ColorSchemeStore.set('dark')}>Dark</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => ColorSchemeStore.set('system')}>System</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
