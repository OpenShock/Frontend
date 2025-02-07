<script lang="ts">
  import { page } from '$app/state';
  import * as Card from '$lib/components/ui/card';

  let hubId = $derived(page.params.hubId);
</script>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">Update Hub</Card.Title>
    <Card.Description>Here you can update your hub.</Card.Description>
  </Card.Header>
  <Card.Content>TODO {hubId}</Card.Content>
</div>
