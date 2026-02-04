<script lang="ts">
  import { RadToDeg, clamp, getCircleX, getCircleY, invLerp, lerp } from '$lib/utils/math';
  import { onDestroy } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';

  // Gauge constants
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

  // Unique gauge IDs
  const id = $props.id();
  const inputId = id + '-input';
  const labelId = id + '-label';
  const gaugeId = id + '-gauge';

  interface Props {
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
    tabindex?: number | null;
  }

  let { name, value = $bindable(), min, max, step, tabindex }: Props = $props();

  // Non-reactive variables for keeping track of slider state
  let isTracking = false;
  let element: SVGSVGElement;
  let lastFraction: number | null = null;

  // --- helpers ---
  function fractionFromEvent(event: PointerEvent) {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const angle = Math.atan2(event.clientX - cx, cy - event.clientY) * RadToDeg;

    // Map angle to [0..1] relative to our arc
    return clamp(angle / angleRange + 0.5, 0, 1);
  }

  function applyWrapProtection(fraction: number) {
    if (lastFraction === null) return fraction;

    const diff = Math.abs(fraction - lastFraction);

    // If the diff is large, it means we jumped across the bottom.
    // Require going via 0.5 (top) before wrapping.
    if (diff > 0.5) {
      if (lastFraction > 0.75 && fraction < 0.25) {
        // Trying to jump from max to min
        return 1; // stick to max
      } else if (lastFraction < 0.25 && fraction > 0.75) {
        // Trying to jump from min to max
        return 0; // stick to min
      }
    }
    return fraction;
  }

  function updateValueFromFraction(fraction: number) {
    value = lerp(min, max, fraction);
    lastFraction = fraction;
  }

  // Pointer handlers
  function handlePointerMoveDrag(event: PointerEvent) {
    updateValueFromFraction(applyWrapProtection(fractionFromEvent(event)));
  }

  function stopTracking() {
    isTracking = false;
    window.removeEventListener('pointermove', handlePointerMoveDrag);
    window.removeEventListener('pointerup', stopTracking);
    lastFraction = null; // reset for next interaction
  }

  function startTracking(event: PointerEvent) {
    event.preventDefault();

    // Always jump to exact pointer position on start (wrap protection OFF)
    updateValueFromFraction(fractionFromEvent(event));

    element.setPointerCapture(event.pointerId);

    if (!isTracking) {
      isTracking = true;
      window.addEventListener('pointermove', handlePointerMoveDrag);
      window.addEventListener('pointerup', stopTracking);
    }
  }

  onDestroy(stopTracking);

  // Smooth animation to snapped values
  const tween = new Tween(value, {
    duration: 400,
    easing: cubicOut,
  });

  // Update animated value based on value, step, min, and max
  $effect(() => {
    const stepped = Math.round((value - min) / step) * step + min;
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

<div class="relative size-[150px] select-none">
  <svg viewBox="0 0 {viewWidth} {viewHeight}" class="absolute size-[150px]" bind:this={element}>
    <!-- background arc -->
    <path
      d={calcSvgPathData(angleEnd)}
      class="cursor-pointer fill-none stroke-neutral-200 stroke-[20] dark:stroke-neutral-800"
      stroke-linecap="round"
      aria-hidden="true"
      onpointerdown={startTracking}
    />

    <!-- foreground arc -->
    <path
      id={gaugeId}
      d={calcSvgPathData(degrees)}
      class="cursor-pointer fill-none stroke-blue-500 stroke-[10] dark:stroke-blue-400"
      stroke-linecap="round"
      aria-hidden="true"
      onpointerdown={startTracking}
    />

    <!-- knob -->
    <circle
      r="10"
      cx={centerX + getCircleX(radius, degrees)}
      cy={centerY + getCircleY(radius, degrees)}
      onpointerdown={startTracking}
      role="slider"
      tabindex={tabindex ?? 0}
      aria-valuemin={min}
      aria-valuenow={value}
      aria-valuemax={max}
      aria-labelledby={labelId}
      aria-controls={gaugeId}
      class="cursor-move fill-white stroke-neutral-400 drop-shadow-md outline-none focus:ring-2 focus:ring-blue-500/60 dark:fill-neutral-900 dark:stroke-neutral-700"
    />
  </svg>

  <!-- numeric input -->
  <input
    id={inputId}
    type="number"
    {name}
    {min}
    bind:value
    {max}
    {step}
    aria-label="Value"
    class="hide-spinners absolute top-1/2 left-1/2 w-10 -translate-1/2 border-none bg-transparent text-center text-xl font-bold text-gray-900 focus:outline-none dark:text-gray-100"
  />

  <!-- gauge label -->
  <label
    id={labelId}
    for={inputId}
    aria-label="Name"
    class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/10 text-center text-neutral-600 dark:text-neutral-300"
  >
    {name}
  </label>
</div>
