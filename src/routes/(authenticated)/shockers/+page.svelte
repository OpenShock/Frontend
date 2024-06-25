<script lang="ts">
  import { shockerV1Api } from '$lib/api';
  import RootComponent from '$lib/components/ControlModules/RootComponent.svelte';
  import { OwnDevicesStore } from '$lib/stores/DevicesStore';
</script>

<!-- Rounded bordered container -->
<div class="container mx-auto py-4 flex flex-wrap justify-center items-stretch gap-4">
  {#if $OwnDevicesStore == null}
    <p>Loading...</p>
  {:else}
    <!-- Grid container -->
    {#each $OwnDevicesStore as device}
      <!-- Grid item -->
      <RootComponent {device} />
    {/each}
  {/if}
</div>
