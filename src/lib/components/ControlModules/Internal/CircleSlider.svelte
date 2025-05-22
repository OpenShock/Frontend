<script lang="ts">
  import { RadToDeg, clamp, getCircleX, getCircleY, invLerp, lerp } from '$lib/utils/math';
  import { onDestroy } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';

  const viewHeight = 100;
  const viewWidth = 100;
  const centerX = viewWidth / 2;
  const centerY = viewHeight / 2;
  const radius = 40;
  const angleStart = 135;
  const angleEnd = 405;
  const angleRange = angleEnd - angleStart;

  const arcStartX = centerX + getCircleX(radius, angleStart);
  const arcStartY = centerY + getCircleY(radius, angleStart);

  const id = $props.id();
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

  let isTracking = false;
  let canvasHandle = $state<HTMLDivElement | undefined>();

  function handlePointerMovement(event: MouseEvent | TouchEvent) {
    if (!canvasHandle) return;
    event.ele;

    const rect = canvasHandle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

    const angle = Math.atan2(clientX - centerX, centerY - clientY) * RadToDeg;

    const fraction = clamp(angle / angleRange + 0.5, 0, 1);

    value = lerp(min, max, fraction);
  }
  function stopTracking() {
    isTracking = false;
    window.removeEventListener('pointermove', handlePointerMovement);
    window.removeEventListener('pointerup', stopTracking);
  }
  function startTracking(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    if (!isTracking) {
      isTracking = true;
      window.addEventListener('pointermove', handlePointerMovement);
      window.addEventListener('pointerup', stopTracking);
    }

    handlePointerMovement(event);
  }
  onDestroy(stopTracking);

  // Smooth animation to snapped values
  const tween = new Tween(value, {
    duration: 400,
    easing: cubicOut,
  });

  // Update animated value based on value, step, min, and max
  $effect(() => {
    const stepped = Math.round(value / step) * step;
    const rounded = Math.round((stepped + Number.EPSILON) * 100) / 100;
    value = clamp(rounded, min, max);
    tween.set(value);
  });

  // Update visual progress
  let degrees = $derived(angleStart + invLerp(min, max, tween.current) * angleRange);

  function calcSvgPathData(angleEnd: number) {
    const arcEndX = centerX + getCircleX(radius, angleEnd);
    const arcEndY = centerY + getCircleY(radius, angleEnd);
    const largeArcFlag = angleEnd - angleStart < 180 ? 0 : 1;

    return `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}`;
  }
</script>

<div class="relative size-[150px]" bind:this={canvasHandle}>
  <svg viewBox="0 0 {viewWidth} {viewHeight}" class="absolute size-[150px]">
    <path
      d={calcSvgPathData(angleEnd)}
      fill="none"
      stroke="rgb(27, 29, 30)"
      stroke-width="20"
      stroke-linecap="round"
      cursor="pointer"
      aria-hidden="true"
      onpointerdown={startTracking}
    />
    <path
      id={guageId}
      d={calcSvgPathData(degrees)}
      fill="none"
      stroke="rgb(0, 122, 255)"
      stroke-width="10"
      stroke-linecap="round"
      cursor="pointer"
      aria-hidden="true"
      onpointerdown={startTracking}
    />
  </svg>
  <div
    onpointerdown={startTracking}
    role="slider"
    {tabindex}
    aria-valuemin={min}
    aria-valuenow={value}
    aria-valuemax={max}
    aria-labelledby={labelId}
    aria-controls={guageId}
    class="absolute size-[30px] cursor-move rounded-full bg-white"
    style="top: {60 + getCircleY(60, degrees)}px; left: {60 + getCircleX(60, degrees)}px;"
  ></div>
  <input
    id={inputId}
    type="number"
    {name}
    {min}
    bind:value
    {max}
    {step}
    aria-label="Value"
    class="hide-spinners absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] transform border-none bg-transparent text-center text-xl font-bold select-none"
  />
  <label
    id={labelId}
    for={inputId}
    aria-label="Name"
    class="absolute bottom-0 left-[50%] -translate-x-[50%] translate-y-[10%] transform text-center select-none"
  >
    {name}
  </label>
</div>
