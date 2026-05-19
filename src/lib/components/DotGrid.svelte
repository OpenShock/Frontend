<script lang="ts">
  let mouseX = $state(-9999);
  let mouseY = $state(-9999);
  let rafPending = false;
  let containerEl: HTMLDivElement | undefined = $state();

  export function handlePointerMove(e: PointerEvent) {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const rect = containerEl?.getBoundingClientRect();
      mouseX = rect ? e.clientX - rect.left : e.clientX;
      mouseY = rect ? e.clientY - rect.top : e.clientY;
      rafPending = false;
    });
  }
</script>

<div bind:this={containerEl} class="pointer-events-none absolute inset-0">
  <div class="bg-grid absolute inset-0" aria-hidden="true"></div>
  <div
    class="bg-grid-spotlight absolute inset-0"
    style:--mouse-x="{mouseX}px"
    style:--mouse-y="{mouseY}px"
    aria-hidden="true"
  ></div>
</div>

<style>
  .bg-grid {
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size: 28px 28px;
    background-position: center center;
  }

  .bg-grid-spotlight {
    background-image: radial-gradient(circle, rgba(225, 74, 109, 0.9) 1px, transparent 1px);
    background-size: 28px 28px;
    background-position: center center;
    mask-image: radial-gradient(
      circle 220px at var(--mouse-x, -9999px) var(--mouse-y, -9999px),
      black 0%,
      transparent 75%
    );
    -webkit-mask-image: radial-gradient(
      circle 220px at var(--mouse-x, -9999px) var(--mouse-y, -9999px),
      black 0%,
      transparent 75%
    );
  }
</style>
