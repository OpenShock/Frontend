<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import * as Card from '$lib/components/ui/card/index.js';
  import { FieldDescription } from '$lib/components/ui/field/index.js';

  let error = $derived(page.url.searchParams.get('error'));
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Authentication Error</Card.Title>
    <Card.Description>Something went wrong during authentication</Card.Description>
  </Card.Header>
  <Card.Content>
    <p class="text-destructive text-center" role="alert">{error}</p>
    <FieldDescription class="mt-4 text-center">
      <a href={resolve('/login')}>Back to login</a>
    </FieldDescription>
  </Card.Content>
</Card.Root>
