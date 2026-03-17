<script lang="ts">
  import { asset } from '$app/paths';
  import Container from '$lib/components/Container.svelte';
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

<Container class="items-center-safe justify-center-safe p-0!">
  <span class="flex items-center gap-2 self-center font-medium">
    <img class="ml-[0.667px] h-7.5" src={asset('/IconSpinning.svg')} alt="OpenShock Logo" />
    <img
      class="h-7.5 transition-opacity delay-100 duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:delay-0"
      src={asset('/LogoTextOnly.svg')}
      alt="OpenShock Logo"
    />
  </span>
  <div class="flex max-w-sm flex-col gap-6">
    {@render children?.()}
  </div>
</Container>
