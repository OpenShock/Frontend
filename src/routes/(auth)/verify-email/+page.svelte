<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import * as Card from '$lib/components/ui/card/index.js';

  let secret = browser && page.url.searchParams.get('token');
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl">Verify Email</Card.Title>
    <Card.Description>Verifying your email address</Card.Description>
  </Card.Header>
  <Card.Content>
    {secret}
  </Card.Content>
</Card.Root>
