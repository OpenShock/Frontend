<script lang="ts">
  import type { LiveShockerState } from '$lib/state/live-control-state.svelte';

  interface Props {
    liveState: LiveShockerState;
    maxIntensity?: number;
    onRelease?: () => void;
  }

  let { liveState, maxIntensity = 100, onRelease }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let y = $state(1);

  let intensity = $derived(Math.round((1 - y) * maxIntensity));

  function startDrag(event: PointerEvent) {
    if (!container) return;
    liveState.isDragging = true;
    container.setPointerCapture(event.pointerId);
    updatePosition(event);
  }

  function onPointerMove(event: PointerEvent) {
    if (!liveState.isDragging || !container) return;
    updatePosition(event);
  }

  function stopDrag() {
    liveState.isDragging = false;
    y = 1;
    liveState.intensity = 0;
    onRelease?.();
  }

  function updatePosition(event: PointerEvent) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    liveState.intensity = intensity;
  }

  const STEP = 0.05;

  function onKeydown(event: KeyboardEvent) {
    let handled = true;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        y = Math.max(0, y - STEP);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        y = Math.min(1, y + STEP);
        break;
      case 'Home':
        y = 0;
        break;
      case 'End':
        y = 1;
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      liveState.intensity = intensity;
    }
  }
</script>

<div class="relative h-full w-full p-4 select-none">
  <div
    bind:this={container}
    class="border-border relative h-full w-full cursor-pointer overflow-hidden rounded-md border"
    onpointerdown={startDrag}
    onpointermove={onPointerMove}
    onpointerup={stopDrag}
    onpointercancel={stopDrag}
    onkeydown={onKeydown}
    role="slider"
    aria-valuenow={intensity}
    aria-valuemin={0}
    aria-valuemax={maxIntensity}
    aria-label="Live intensity"
    tabindex="0"
  >
    <!-- Fill from bottom -->
    <div
      class="bg-muted pointer-events-none absolute bottom-0 left-0 w-full transition-none"
      style="height: {(1 - y) * 100}%"
    ></div>

    <!-- Handle -->
    <div
      class="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-none
        {liveState.isDragging
        ? 'border-border bg-primary h-12 w-12 border'
        : 'bg-primary h-10 w-10 border-2 border-transparent'}"
      style="left: 50%; top: {y * 100}%"
    >
      <span
        class="text-primary-foreground flex h-full items-center justify-center text-sm font-medium"
      >
        {intensity}%
      </span>
    </div>
  </div>
</div>
