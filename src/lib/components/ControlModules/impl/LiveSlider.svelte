<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { LiveShockerState } from '$lib/state/live-control-state.svelte';

  interface Props {
    liveState: LiveShockerState;
    maxIntensity?: number;
    onRelease?: () => void;
  }

  let { liveState, maxIntensity = 100, onRelease }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let y = $state(1);

  let intensity = $derived(Math.round((1 - y) * maxIntensity));

  const WINDOW_MS = 3000;
  const SAMPLE_INTERVAL_MS = 16;
  const MAX_SAMPLES = Math.ceil(WINDOW_MS / SAMPLE_INTERVAL_MS) + 2;

  const SMOOTHING_TAU_MS = 50;

  const samples: { t: number; v: number }[] = [];
  let smoothed = 0;
  let lastFrameAt = 0;
  let lastSampleAt = 0;
  let rafId = 0;
  let strokeColor = '#ffffff';

  function pushSample(now: number) {
    samples.push({ t: now, v: smoothed });
    if (samples.length > MAX_SAMPLES) samples.shift();
    lastSampleAt = now;
  }

  function draw(now: number) {
    rafId = requestAnimationFrame(draw);
    if (!canvas) return;

    const dt = lastFrameAt === 0 ? 0 : now - lastFrameAt;
    lastFrameAt = now;
    const alpha = 1 - Math.exp(-dt / SMOOTHING_TAU_MS);
    smoothed += (liveState.intensity - smoothed) * alpha;

    if (now - lastSampleAt >= SAMPLE_INTERVAL_MS) pushSample(now);

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    if (samples.length < 2) return;

    const SUBSTEPS = 1;
    const toX = (t: number) => w - ((now - t) / WINDOW_MS) * w;
    const toY = (v: number) => h - (Math.min(v, maxIntensity) / maxIntensity) * h;

    ctx.beginPath();
    const first = samples[0];
    ctx.moveTo(toX(first.t), toY(first.v));
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1];
      const b = samples[i];
      const ax = toX(a.t);
      const bx = toX(b.t);
      const ay = toY(a.v);
      const by = toY(b.v);
      for (let s = 1; s <= SUBSTEPS; s++) {
        const t = s / SUBSTEPS;
        const e = t * t * (3 - 2 * t);
        ctx.lineTo(ax + (bx - ax) * t, ay + (by - ay) * e);
      }
    }

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.4, strokeColor);
    gradient.addColorStop(1, strokeColor);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Outer blurred glow pass
    ctx.save();
    ctx.lineWidth = 8 * dpr;
    ctx.strokeStyle = gradient;
    ctx.globalAlpha = 0.35;
    ctx.filter = `blur(${4 * dpr}px)`;
    ctx.stroke();
    ctx.restore();

    // Crisp inner pass
    ctx.lineWidth = 4 * dpr;
    ctx.strokeStyle = gradient;
    ctx.stroke();
  }

  onMount(() => {
    const styles = getComputedStyle(canvas!);
    strokeColor = styles.color || strokeColor;
    pushSample(performance.now());
    rafId = requestAnimationFrame(draw);
  });

  onDestroy(() => cancelAnimationFrame(rafId));

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
    class="relative h-full w-full cursor-pointer"
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
    <!-- Intensity-history graph: newest on the right, slides smoothly left over time -->
    <div class="border-border absolute inset-0 overflow-hidden rounded-md border">
      <canvas
        bind:this={canvas}
        class="text-primary pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      ></canvas>
    </div>

    <!-- Handle (outside the clipped rectangle so text can overflow) -->
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
