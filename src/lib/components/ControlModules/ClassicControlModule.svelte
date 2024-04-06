<script lang="ts">
  import CircleSlider from './Internal/CircleSlider.svelte';

  let value: number = 50;
  export let name: string;
</script>

<CircleSlider name="Module 1" bind:value min={0} max={100} />
