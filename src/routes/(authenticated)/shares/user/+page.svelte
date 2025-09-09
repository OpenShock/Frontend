<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    // This page is just a redirector
    goto('/shares/user/outgoing');
  });
</script>
