<script lang="ts">
  import type { Path } from '$app/types';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';

  interface Props {
    entries: Array<{ label: string; href?: string | null }>;
  }

  let { entries }: Props = $props();

  registerBreadcrumbs(() => entries as Array<{ label: string; href?: Path | null }>);
</script>
