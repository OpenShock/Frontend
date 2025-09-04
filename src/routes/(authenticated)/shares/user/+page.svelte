<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    onMount(() => {
      // This page is just a redirector
      goto('/shares/user/outgoing');
    });
</script>
