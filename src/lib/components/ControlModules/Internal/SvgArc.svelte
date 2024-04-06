<script lang="ts">
  import { getCircleX, getCircleY } from '$lib/utils/math';

  export let centerX: number;
  export let centerY: number;
  export let angleStart: number;
  export let angleEnd: number;
  export let radius: number;
  export let strokeWidth: number;
  export let color: string;
  export let cursor: string;

  $: rx = centerX + getCircleX(radius, angleStart);
  $: ry = centerY + getCircleY(radius, angleStart);
  $: x = centerX + getCircleX(radius, angleEnd);
  $: y = centerY + getCircleY(radius, angleEnd);

  $: largeArcFlag = angleEnd - angleStart < 180 ? 0 : 1;
</script>

<path
  d="M {rx} {ry} A {radius} {radius} 0 {largeArcFlag} 1 {x} {y}"
  fill="transparent"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  style="stroke: {color}; cursor: {cursor};"
/>
