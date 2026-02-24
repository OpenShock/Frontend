<script lang="ts">
  import { UserStore } from '$lib/stores/UserStore';
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
    if (!$UserStore.loading && $UserStore.self) {
      void gotoQueryRedirectOrFallback('/home');
    }
  });
</script>

{@render children?.()}
