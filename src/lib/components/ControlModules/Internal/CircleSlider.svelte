<script lang="ts">
  import { run } from 'svelte/legacy';

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

  let canvasHandle: HTMLDivElement | undefined = $state();
  let sliderHandle: HTMLDivElement | undefined = $state();

  function stupidUnfloatHack(value: number) {
    // This is a stupid hack to avoid floating point errors, needed to make UI not look like shit
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
  function updateValueFromSlider(event: MouseEvent | TouchEvent) {
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
  function trackingUpdated(event: MouseEvent | TouchEvent) {
    updateValueFromSlider(event);
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

    updateValueFromSlider(event);
  }
  onDestroy(() => {
    trackingStopped();
  });

  // Smooth animation
  const animatedValue = tweened(value, {
    duration: 400,
    easing: cubicOut,
  });

  // Sanitize and update value
  run(() => {
    if (value < min) value = min;
    if (value > max) value = max;
    value = stupidUnfloatHack(Math.round(value / step) * step);
    animatedValue.set(value);
  });

  // Update visual progress
  let progressProps = $state({});
  run(() => {
    let degrees = angleStart + invLerp(min, max, $animatedValue) * angleRange;

    progressProps = calcSvgArcProps(center, angleStart, degrees, radius, 10);

    if (sliderHandle) {
      sliderHandle.style.left = `${60 + getCircleX(60, degrees)}px`; // TODO: Avoid using pixel values
      sliderHandle.style.top = `${60 + getCircleY(60, degrees)}px`; // TODO: Avoid using pixel values
    }
  });
</script>

<div>
  <div class="canvas" bind:this={canvasHandle}>
    <svg class="tracks" viewBox="0 0 {viewSize.x} {viewSize.y}">
      <path
        {...calcSvgArcProps(center, angleStart, angleEnd, radius, 20)}
        fill="none"
        stroke-linecap="round"
        style="stroke: rgb(27, 29, 30)"
        ontouchstart={trackingStarted}
        onmousedown={trackingStarted}
        aria-hidden="true"
      />
      <path
        {...progressProps}
        fill="none"
        stroke-linecap="round"
        class="stroke-secondary-500"
        ontouchstart={trackingStarted}
        onmousedown={trackingStarted}
        id={guageId}
        aria-hidden="true"
      />
    </svg>
    <div
      class="handle"
      bind:this={sliderHandle}
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
    <input id={inputId} type="number" {name} {min} bind:value {max} {step} aria-label="Value" />
    <label for={inputId} aria-label="Name">
      {name}
    </label>
  </div>
</div>

<style lang="postcss">
  .canvas {
    @apply relative w-[150px] h-[150px];
  }
  svg {
    @apply absolute w-[150px] h-[150px];
  }
  path {
    @apply cursor-pointer;
  }
  .handle {
    @apply absolute w-[30px] h-[30px] rounded-full bg-white cursor-move;
  }
  input[type='number'] {
    @apply absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] text-xl font-bold select-none appearance-none bg-transparent border-none text-center;

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
    @apply absolute bottom-0 left-[50%] transform -translate-x-[50%] translate-y-[10%] text-center select-none;
  }
</style>
