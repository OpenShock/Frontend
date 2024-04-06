<script lang="ts">
  export let centerX: number;
  export let centerY: number;
  export let angleStart: number;
  export let angleEnd: number;
  export let radius: number;
  export let strokeWidth: number;
  export let color: string;
  export let cursor: string;

  const RadToDeg = Math.PI / 180;

  $: rx = centerX + radius * Math.cos(angleStart * RadToDeg);
  $: ry = centerY + radius * Math.sin(angleStart * RadToDeg);
  $: x = centerX + radius * Math.cos(angleEnd * RadToDeg);
  $: y = centerY + radius * Math.sin(angleEnd * RadToDeg);

  $: largeArcFlag = angleEnd - angleStart < 180 ? 0 : 1;
</script>

<path
  d="M {rx} {ry} A {radius} {radius} 0 {largeArcFlag} 1 {x} {y}"
  fill="transparent"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  style="stroke: {color}; cursor: {cursor};"
/>
