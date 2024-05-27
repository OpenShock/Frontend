<script lang="ts">
  import RootComponent from '$lib/components/ControlModules/RootComponent.svelte';
</script>

<!-- Rounded bordered container -->
<div class="container mx-auto py-4 flex flex-wrap justify-center items-stretch gap-4">
  <!-- Grid container -->
  {#each [...Array(4).keys()] as a}
    <!-- Grid item -->
    <RootComponent name={`Module ${a + 1}`} />
  {/each}
</div>
