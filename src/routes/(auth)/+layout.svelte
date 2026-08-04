<script lang="ts">
  import { asset } from '$app/paths';
  import { Container } from '@openshock/svelte-core/components';
  import { AuthStatus, authState } from '$lib/state/auth-state.svelte';
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
    if (authState.status === AuthStatus.Authenticated) {
      void gotoQueryRedirectOrFallback('/home');
    }
  });
</script>

<Container class="items-center-safe justify-center-safe p-0!">
  <span class="flex items-center gap-2 self-center font-medium">
    <img class="h-8" src={asset('/logo.svg')} alt="OpenShock Logo" />
  </span>
  <div class="flex max-w-sm flex-col gap-6">
    {@render children?.()}
  </div>
</Container>
