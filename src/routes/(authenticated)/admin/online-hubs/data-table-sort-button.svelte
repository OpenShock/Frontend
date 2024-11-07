<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import type { ComponentProps } from 'svelte';

  import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';

  let {
    variant = 'ghost',
    name,
    ...restProps
  }: ComponentProps<typeof Button> & { name: string } = $props();
</script>

<Button {variant} {...restProps}>
  {name}
  <ArrowUpDown class="ml-2 size-4" />
</Button>
