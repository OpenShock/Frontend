<script lang="ts">
  import SvgArc from './SvgArc.svelte';
  import { dragcircle } from './dragcircle';

  const RadToDeg = Math.PI / 180;

  const angleStart = 135;
  const angleEnd = 405;
  const angleRange = angleEnd - angleStart;

  const commonProps = {
    centerX: 50,
    centerY: 50,
    angleStart,
    angleEnd,
    radius: 40,
    cursor: 'pointer',
  };

  export let name: string;
  export let value: number;
  export let min: number;
  export let max: number;

  let sliderHandle: HTMLDivElement;

  $: {
    if (sliderHandle) {
      sliderHandle.style.left = `${60 + 60 * Math.cos(degrees * RadToDeg)}px`;
      sliderHandle.style.top = `${60 + 60 * Math.sin(degrees * RadToDeg)}px`;
    }
  }

  $: fraction = (value - min) / (max - min);
  $: degrees = angleStart + fraction * angleRange;
</script>

<div>
  <div class="canvas">
    <svg class="tracks" viewBox="0 0 100 100">
      <SvgArc {...commonProps} strokeWidth={20} color="rgb(27, 29, 30)" />
      <SvgArc {...commonProps} angleEnd={degrees} strokeWidth={10} color="rgb(27, 180, 180)" />
    </svg>
    <div
      class="handle"
      use:dragcircle={{ centerX: 50, centerY: 50, radius: 50, angleStart, angleEnd }}
      bind:this={sliderHandle}
    />
    <span>{Math.round(fraction * 100)}</span>
    <p>{name}</p>
  </div>
  <input type="hidden" {name} {value} />
</div>

<style lang="postcss">
  .canvas {
    @apply relative w-[150px] h-[150px];
  }
  svg {
    @apply absolute w-[150px] h-[150px];
  }
  .handle {
    @apply absolute w-[30px] h-[30px] rounded-full bg-white cursor-move;
  }
  span {
    @apply absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] text-xl font-bold;
  }
  p {
    @apply absolute bottom-0 left-[50%] transform -translate-x-[50%] translate-y-[10%] text-center;
  }
</style>
