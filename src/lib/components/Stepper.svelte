<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export interface StepperStep {
    title: string;
    content: Snippet;
  }

  export type StepperOrientation = 'horizontal' | 'vertical';
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';

  interface Props {
    steps: StepperStep[];
    initialStep?: number;
    showNavigation?: boolean;
    orientation?: StepperOrientation;
    onStepChange?: (step: number) => void;
    class?: string;
  }

  let {
    steps,
    initialStep = 0,
    showNavigation = true,
    orientation = 'horizontal',
    onStepChange,
    class: className,
  }: Props = $props();

  let active = $state(
    untrack(() => Math.min(Math.max(initialStep, 0), Math.max(steps.length - 1, 0)))
  );

  function goTo(i: number) {
    if (i < 0 || i >= steps.length || i === active) return;
    active = i;
    onStepChange?.(i);
  }

  let canPrev = $derived(active > 0);
  let canNext = $derived(active < steps.length - 1);
</script>

{#snippet circle(i: number, title: string, isCurrent: boolean, isCompleted: boolean)}
  <button
    type="button"
    role="tab"
    aria-selected={isCurrent}
    aria-label="Step {i + 1}: {title}"
    onclick={() => goTo(i)}
    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors
      {isCompleted
      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
      : isCurrent
        ? 'bg-primary text-primary-foreground ring-primary/30 ring-4'
        : 'border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/60 border-2'}"
  >
    {#if isCompleted}
      <Check class="h-4 w-4" />
    {:else}
      {i + 1}
    {/if}
  </button>
{/snippet}

<div class="flex h-full min-h-0 flex-col gap-4 {className ?? ''}">
  {#if orientation === 'horizontal'}
    <!-- Horizontal step indicator -->
    <div class="flex flex-none items-start" role="tablist" aria-label="Steps">
      {#each steps as step, i (i)}
        {@const isCurrent = i === active}
        {@const isCompleted = i < active}
        <div class="flex flex-1 flex-col items-center gap-2 {i === 0 ? '' : 'min-w-0'}">
          <div class="flex w-full items-center">
            <div
              class="h-0.5 flex-1 {i === 0
                ? 'invisible'
                : isCompleted || isCurrent
                  ? 'bg-primary'
                  : 'bg-muted-foreground/20'}"
            ></div>
            {@render circle(i, step.title, isCurrent, isCompleted)}
            <div
              class="h-0.5 flex-1 {i === steps.length - 1
                ? 'invisible'
                : isCompleted
                  ? 'bg-primary'
                  : 'bg-muted-foreground/20'}"
            ></div>
          </div>
          <button
            type="button"
            onclick={() => goTo(i)}
            class="w-full px-1 text-center text-xs leading-tight transition-colors {isCurrent
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            {step.title}
          </button>
        </div>
      {/each}
    </div>

    <!-- Active step content (scrolls if it overflows) -->
    <div class="min-h-0 flex-1 overflow-y-auto py-2">
      {@render steps[active].content()}
    </div>
  {:else}
    <!-- Vertical stepper: list of steps with the active one expanded inline -->
    <div class="min-h-0 flex-1 overflow-y-auto" role="tablist" aria-label="Steps">
      {#each steps as step, i (i)}
        {@const isCurrent = i === active}
        {@const isCompleted = i < active}
        {@const isLast = i === steps.length - 1}
        <div class="flex gap-4">
          <!-- Indicator column with vertical connector -->
          <div class="flex flex-col items-center">
            {@render circle(i, step.title, isCurrent, isCompleted)}
            {#if !isLast}
              <div
                class="w-0.5 flex-1 {isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'}"
                style="min-height: 1rem;"
              ></div>
            {/if}
          </div>
          <!-- Title + (active) content -->
          <div class="flex-1 {isLast ? '' : 'pb-4'}">
            <button
              type="button"
              onclick={() => goTo(i)}
              class="block w-full pt-1 text-left text-base leading-tight transition-colors {isCurrent
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'}"
            >
              {step.title}
            </button>
            {#if isCurrent}
              <div class="mt-3">
                {@render step.content()}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if showNavigation && steps.length > 1}
    <div class="flex flex-none justify-between gap-2 border-t pt-4">
      <Button variant="outline" disabled={!canPrev} onclick={() => goTo(active - 1)}>
        {#if orientation === 'vertical'}
          <ChevronUp />
        {:else}
          <ChevronLeft />
        {/if}
        Previous
      </Button>
      <Button disabled={!canNext} onclick={() => goTo(active + 1)}>
        Next
        {#if orientation === 'vertical'}
          <ChevronDown />
        {:else}
          <ChevronRight />
        {/if}
      </Button>
    </div>
  {/if}
</div>
