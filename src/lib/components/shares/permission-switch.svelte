<script lang="ts">
  import type { IconProps } from '@lucide/svelte';
  import { Switch } from '$lib/components/ui/switch';
  import type { Component } from 'svelte';

  interface Props {
    icon: Component<IconProps, {}, ''>;
    enabled: boolean;
  }

  let { icon: Icon, enabled = $bindable() }: Props = $props();
</script>

<button
  class="flex h-30 w-30 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-1 border-neutral-800 p-4 transition-colors duration-300 hover:bg-neutral-800"
  aria-label="Toggle permission"
  onclick={() => (enabled = !enabled)}
>
  <Icon size="100%" />
  <Switch checked={enabled} />
</button>
