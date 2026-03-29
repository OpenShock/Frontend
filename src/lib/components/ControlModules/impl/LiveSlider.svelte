<script lang="ts">
  import type { LiveShockerState } from '$lib/state/live-control-state.svelte';

  interface Props {
    liveState: LiveShockerState;
    maxIntensity?: number;
  }

  let { liveState, maxIntensity = 100 }: Props = $props();

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
  }

  function updatePosition(event: PointerEvent) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    liveState.intensity = intensity;
  }
</script>

<div class="relative h-full w-full select-none p-4">
  <div
    bind:this={container}
    class="relative h-full w-full cursor-pointer overflow-hidden rounded-md border border-border"
    onpointerdown={startDrag}
    onpointermove={onPointerMove}
    onpointerup={stopDrag}
    onpointercancel={stopDrag}
    role="slider"
    aria-valuenow={intensity}
    aria-valuemin={0}
    aria-valuemax={maxIntensity}
    aria-label="Live intensity"
    tabindex="0"
  >
    <!-- Fill from bottom -->
    <div
      class="pointer-events-none absolute bottom-0 left-0 w-full bg-muted transition-none"
      style="height: {(1 - y) * 100}%"
    ></div>

    <!-- Handle -->
    <div
      class="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-none
        {liveState.isDragging
        ? 'h-12 w-12 border border-border bg-primary'
        : 'h-10 w-10 border-2 border-transparent bg-primary'}"
      style="left: 50%; top: {y * 100}%"
    >
      <span
        class="flex h-full items-center justify-center text-sm font-medium text-primary-foreground"
      >
        {intensity}%
      </span>
    </div>
  </div>
</div>
