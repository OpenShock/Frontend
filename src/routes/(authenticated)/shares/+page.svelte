<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { ArrowBigRight } from '@lucide/svelte';
</script>

<div class="container my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
  <Card.Root>
    <Card.Header>
      <Card.Title>User Shares</Card.Title>
      <Card.Description>Manage Shockers Shared with other Users directly</Card.Description>
    </Card.Header>
    <Card.Content>
      <p>Card Content</p>
    </Card.Content>
    <Card.Footer>
      <Button class="ml-auto w-15">
        <ArrowBigRight />
      </Button>
    </Card.Footer>
  </Card.Root>
  <Card.Root>
    <Card.Header>
      <Card.Title>Share Links</Card.Title>
      <Card.Description>Active Share Links</Card.Description>
    </Card.Header>
    <Card.Content>
      <p>Card Content</p>
    </Card.Content>
    <Card.Footer>
      <Button class="ml-auto w-15" href="/shares/links">
        <ArrowBigRight />
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
