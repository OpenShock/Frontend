<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import type { Control, ControlType } from '$lib/api/internal/v2';
  import { onMount } from 'svelte';

  interface Props {
    shockers: ShockerResponse[];
    controlHandler: (controls: Control[]) => void;
  }

  let { shockers, controlHandler }: Props = $props();

  let intensity: number = 25;
  let duration: number = 1;

  let canvas = $state<HTMLCanvasElement | undefined>();

  onMount(() => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Draw human body
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 2000, 1300);

    // Draw head
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(1000, 300, 200, 0, 2 * Math.PI);
    ctx.fill();

    // Draw body
    ctx.fillStyle = 'white';
    ctx.fillRect(900, 500, 200, 500);

    // Draw arms
    ctx.fillStyle = 'white';
    ctx.fillRect(700, 500, 200, 50);
    ctx.fillRect(1100, 500, 200, 50);

    // Draw legs
    ctx.fillStyle = 'white';
    ctx.fillRect(900, 1000, 50, 200);
    ctx.fillRect(1050, 1000, 50, 200);
  });
</script>

<canvas bind:this={canvas} width="2000" height="1300" class="size-full"></canvas>
