<script lang="ts">
  import { Container } from '@openshock/svelte-core/components';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [{ label: 'Profile' }]);
</script>

<Container>
  <h1 class="text-3xl font-bold">Profile</h1>
  <div
    class="border-border bg-card flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20"
  >
    <p class="text-muted-foreground text-sm">Your profile page is coming soon.</p>
  </div>
</Container>
