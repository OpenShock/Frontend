<script lang="ts">
  import type { Pathname } from '$app/types';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  interface Props {
    entries: Array<{ label: string; href?: string | null }>;
  }

  let { entries }: Props = $props();

  registerBreadcrumbs(() => entries as Array<{ label: string; href?: Pathname | null }>);
</script>
