<script lang="ts">
  import { RadToDeg, clamp, getCircleX, getCircleY, lerp } from '$lib/utils/math';
  import { randStr } from '$lib/utils/rand';
  import { onDestroy } from 'svelte';

  const viewSize = { x: 100, y: 100 };
  const center = { x: viewSize.x / 2, y: viewSize.y / 2 };
  const radius = 40;
  const angleStart = 135;
  const angleEnd = 405;
  const angleRange = angleEnd - angleStart;

  const id = randStr(8);
  const labelId = id + '-label';
  const guageId = id + '-guage';

  function calculateProps(
    center: { x: number; y: number },
    angleStart: number,
    angleEnd: number,
    radius: number,
    strokeWidth: number,
    color: string,
    cursor: string | null = null
  ) {
    const rx = center.x + getCircleX(radius, angleStart);
    const ry = center.y + getCircleY(radius, angleStart);
    const x = center.x + getCircleX(radius, angleEnd);
    const y = center.y + getCircleY(radius, angleEnd);
    const largeArcFlag = angleEnd - angleStart < 180 ? 0 : 1;

    let style = `stroke: ${color};`;
    if (cursor) style += `cursor: ${cursor};`;

    return {
      d: `M ${rx} ${ry} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y}`,
      fill: 'none',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round' as const,
      style,
    };
  }

  export let name: string;
  export let value: number;
  export let min: number;
  export let max: number;
  export let tabindex: number | null | undefined = undefined;

  let canvasHandle: HTMLDivElement;
  let sliderHandle: HTMLDivElement;

  function calculateSliderPosition(event: MouseEvent | TouchEvent) {
    if (!canvasHandle) return;

    const rect = canvasHandle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

    const angle = Math.atan2(clientX - centerX, centerY - clientY) * RadToDeg;

    const fraction = clamp(angle / angleRange + 0.5, 0, 1);

    value = lerp(min, max, fraction);
  }

  function handleMove(event: MouseEvent | TouchEvent) {
    calculateSliderPosition(event);
  }

  function stopTracking() {
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', stopTracking);
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', stopTracking);
  }

  function startTracking(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    if (!canvasHandle) return;

    if ('ontouchstart' in window) {
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', stopTracking);
    } else {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', stopTracking);
    }

    calculateSliderPosition(event);
  }

  onDestroy(() => {
    stopTracking();
  });

  $: if (sliderHandle) {
    sliderHandle.style.left = `${60 + getCircleX(60, degrees)}px`; // TODO: Avoid using pixel values
    sliderHandle.style.top = `${60 + getCircleY(60, degrees)}px`; // TODO: Avoid using pixel values
  }

  $: fraction = (value - min) / (max - min);
  $: degrees = angleStart + fraction * angleRange;
</script>

<div>
  <div class="canvas" bind:this={canvasHandle}>
    <svg class="tracks" viewBox="0 0 {viewSize.x} {viewSize.y}">
      <path
        {...calculateProps(center, angleStart, angleEnd, radius, 20, 'rgb(27, 29, 30)', 'pointer')}
        on:touchstart={startTracking}
        on:mousedown={startTracking}
        aria-hidden="true"
      />
      <path
        {...calculateProps(center, angleStart, degrees, radius, 10, 'rgb(27, 180, 180)', 'pointer')}
        on:touchstart={startTracking}
        on:mousedown={startTracking}
        id={guageId}
        aria-hidden="true"
      />
    </svg>
    <div
      class="handle"
      bind:this={sliderHandle}
      on:touchstart={startTracking}
      on:mousedown={startTracking}
      role="slider"
      {tabindex}
      aria-valuemin={min}
      aria-valuenow={value}
      aria-valuemax={max}
      aria-labelledby={labelId}
      aria-controls={guageId}
    />
    <span>{Math.round(fraction * 100)}</span>
    <p id={labelId} aria-label="Value">
      {name}
    </p>
  </div>
  <input type="hidden" {name} {min} {value} {max} />
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
