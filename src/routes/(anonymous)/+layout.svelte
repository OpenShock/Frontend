<script lang="ts">
  import { userState } from '$lib/state/user-state.svelte';
  import { gotoQueryRedirectOrFallback, sanitizeRedirectSearchParam } from '$lib/utils/url';
  import { onMount, type Snippet } from 'svelte';
  import { toast } from 'svelte-sonner';

  let { children }: { children?: Snippet } = $props();

  onMount(() => {
    if (sanitizeRedirectSearchParam()) {
      toast.warning('An invalid redirect URL was removed for your safety.');
    }
  });

  $effect(() => {
    if (!userState.loading && userState.self) {
      void gotoQueryRedirectOrFallback('/home');
    }
  });
</script>

{@render children?.()}
