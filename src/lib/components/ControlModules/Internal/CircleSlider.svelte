<script lang="ts">
  import { RadToDeg, clamp, getCircleX, getCircleY, invLerp, lerp } from '$lib/utils/math';
  import { randStr } from '$lib/utils/rand';
  import { calcSvgArcProps } from '$lib/utils/svg';
  import { onDestroy } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  const viewSize = { x: 100, y: 100 };
  const center = { x: viewSize.x / 2, y: viewSize.y / 2 };
  const radius = 40;
  const angleStart = 135;
  const angleEnd = 405;
  const angleRange = angleEnd - angleStart;

  const id = randStr(8);
  const inputId = id + '-input';
  const labelId = id + '-label';
  const guageId = id + '-guage';

  interface Props {
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
    tabindex?: number | null | undefined;
  }

  let { name, value = $bindable(), min, max, step, tabindex = undefined }: Props = $props();

  let canvasHandle = $state<HTMLDivElement | undefined>();

  function stupidUnfloatHack(value: number) {
    // This is a stupid hack to avoid floating point errors, needed to make UI not look like shit
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
  function trackingUpdated(event: MouseEvent | TouchEvent) {
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
  function trackingStopped() {
    window.removeEventListener('touchmove', trackingUpdated);
    window.removeEventListener('touchend', trackingStopped);
    window.removeEventListener('mousemove', trackingUpdated);
    window.removeEventListener('mouseup', trackingStopped);
  }
  function trackingStarted(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    if (!canvasHandle) return;

    if ('ontouchstart' in window) {
      window.addEventListener('touchmove', trackingUpdated);
      window.addEventListener('touchend', trackingStopped);
    } else {
      window.addEventListener('mousemove', trackingUpdated);
      window.addEventListener('mouseup', trackingStopped);
    }

    trackingUpdated(event);
  }
  onDestroy(trackingStopped);

  // Smooth animation
  const animatedValue = tweened(value, {
    duration: 400,
    easing: cubicOut,
  });

  // Sanitize and update value
  $effect(() => {
    if (value < min) value = min;
    if (value > max) value = max;
    value = stupidUnfloatHack(Math.round(value / step) * step);
    animatedValue.set(value);
  });

  // Update visual progress
  let degrees = $derived(angleStart + invLerp(min, max, $animatedValue) * angleRange);
  let progressProps = $derived(calcSvgArcProps(center, angleStart, degrees, radius, 10));
</script>

<div>
  <div class="canvas" bind:this={canvasHandle}>
    <svg class="tracks" viewBox="0 0 {viewSize.x} {viewSize.y}">
      <path
        {...calcSvgArcProps(center, angleStart, angleEnd, radius, 20)}
        fill="none"
        stroke-linecap="round"
        style:stroke="rgb(27, 29, 30)"
        ontouchstart={trackingStarted}
        onmousedown={trackingStarted}
        aria-hidden="true"
      />
      <path
        {...progressProps}
        fill="none"
        stroke-linecap="round"
        style:stroke="rgb(0, 122, 255)"
        ontouchstart={trackingStarted}
        onmousedown={trackingStarted}
        id={guageId}
        aria-hidden="true"
      />
    </svg>
    <div
      class="handle"
      style:left={`${60 + getCircleX(60, degrees)}px`}
      style:top={`${60 + getCircleY(60, degrees)}px`}
      ontouchstart={trackingStarted}
      onmousedown={trackingStarted}
      role="slider"
      {tabindex}
      aria-valuemin={min}
      aria-valuenow={value}
      aria-valuemax={max}
      aria-labelledby={labelId}
      aria-controls={guageId}
    ></div>
    <input class="appearance-none" id={inputId} type="number" {name} {min} bind:value {max} {step} aria-label="Value" />
    <label class="appearance-none" id={labelId} for={inputId} aria-label="Name">
      {name}
    </label>
  </div>
</div>

<style lang="postcss">
  .canvas {
    @apply relative size-[150px];
  }
  svg {
    @apply absolute size-[150px];
  }
  path {
    @apply cursor-pointer;
  }
  .handle {
    @apply absolute size-[30px] cursor-move rounded-full bg-white;
  }
  input[type='number'] {
    @apply absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] transform select-none appearance-none border-none bg-transparent text-center text-xl font-bold;

    /* Firefox */
    -moz-appearance: none;
  }
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  label {
    @apply absolute bottom-0 left-[50%] -translate-x-[50%] translate-y-[10%] transform select-none text-center;
  }
</style>
