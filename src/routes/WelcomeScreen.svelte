<script lang="ts" module>
  import { expiringFlags } from '$lib/state/expiring-flags';

  const FLAG_KEY = 'welcomed';
  // Hard cutoff: stop showing the welcome screen and stop refreshing the flag after this date.
  const EXPIRES_AT = new Date('2027-01-01T00:00:00Z');

  function markWelcomed(): void {
    expiringFlags.set(FLAG_KEY, true, EXPIRES_AT);
  }

  function shouldShow(): boolean {
    return Date.now() < EXPIRES_AT.getTime() && expiringFlags.get<boolean>(FLAG_KEY) !== true;
  }
</script>

<script lang="ts">
  import { asset } from '$app/paths';
  import { Button } from '$lib/components/ui/button';
  import { ChevronLeft, ChevronRight, X } from '@lucide/svelte';
  import { onMount, type Snippet } from 'svelte';

  interface Step {
    title: string;
    body: Snippet;
  }

  let open = $state(false);
  let step = $state(0);

  onMount(() => {
    if (shouldShow()) open = true;
  });

  function dismiss() {
    markWelcomed();
    open = false;
  }

  const steps: Step[] = [
    { title: 'Welcome to the new OpenShock', body: stepWelcome },
    { title: "What's new", body: stepFeatures },
    { title: 'Bookmarks still work', body: stepRedirects },
    { title: 'Found a bug?', body: stepFeedback },
  ];

  let isFirst = $derived(step === 0);
  let isLast = $derived(step === steps.length - 1);

  function next() {
    if (isLast) dismiss();
    else step += 1;
  }

  function prev() {
    if (!isFirst) step -= 1;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') dismiss();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
    else if (e.key === 'ArrowLeft') prev();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="bg-background fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="welcome-title"
  >
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground absolute top-6 right-6 transition-colors"
      onclick={dismiss}
      aria-label="Close welcome"
    >
      <X class="size-6" />
    </button>

    <div
      class="flex h-full w-full flex-col px-6 py-12 sm:px-10 {isFirst ? 'max-w-5xl' : 'max-w-2xl'}"
    >
      <div class="flex flex-1 flex-col justify-center">
        {#if isFirst}
          <h1 id="welcome-title" class="sr-only">Welcome to OpenShock</h1>
        {:else}
          <p class="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
            Step {step + 1} of {steps.length}
          </p>
          <h1 id="welcome-title" class="mb-6 text-3xl font-bold sm:text-4xl">
            {steps[step].title}
          </h1>
        {/if}
        <div class="text-base leading-relaxed">
          {@render steps[step].body()}
        </div>
      </div>

      <div class="mt-10 flex flex-none flex-col gap-6">
        <div class="flex justify-center gap-2" role="tablist" aria-label="Steps">
          {#each steps as _, i (i)}
            <button
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label="Go to step {i + 1}"
              onclick={() => (step = i)}
              class="h-2 rounded-full transition-all {i === step
                ? 'bg-primary w-8'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/60 w-2'}"
            ></button>
          {/each}
        </div>

        <div class="flex items-center justify-between gap-2">
          <Button variant="ghost" onclick={dismiss}>Skip</Button>
          <div class="flex gap-2">
            <Button variant="outline" onclick={prev} disabled={isFirst}>
              <ChevronLeft />
              Back
            </Button>
            <Button onclick={next}>
              {isLast ? 'Get started' : 'Next'}
              {#if !isLast}<ChevronRight />{/if}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#snippet stepWelcome()}
  <div class="flex flex-col items-center text-center">
    <p class="text-3xl font-semibold tracking-wide sm:text-4xl" style="color: #e14a6d">
      Welcome to the new
    </p>

    <img
      class="my-8 w-full max-w-3xl sm:my-12"
      src={asset('/logo.svg')}
      alt="OpenShock"
    />

    <p class="text-3xl font-semibold tracking-wide sm:text-4xl" style="color: #e14a6d">
      frontend
    </p>

    <p class="text-muted-foreground mt-10 max-w-md text-base sm:text-lg">
      Over 2 years of work. Faster, fully mobile-friendly, and a much better base for everything
      we want to build next.
    </p>
    <p class="text-muted-foreground mt-4 text-sm">
      Take the quick tour, or skip ahead and dive in.
    </p>
  </div>
{/snippet}

{#snippet stepFeatures()}
  <ul class="space-y-3">
    <li>
      <span class="font-semibold">Reworked shocker dashboard</span>, with groundwork for
      customizable layouts.
    </li>
    <li>
      <span class="font-semibold">Web Terminal</span> for configuring your hub and flashing
      firmware straight from the browser. No installs.
    </li>
    <li>
      <span class="font-semibold">OAuth sign-in</span> so you can log in with accounts you
      already have.
    </li>
    <li>
      <span class="font-semibold">Better sharing</span>: public links, user shares, invite
      tracking, and per-shocker shortcuts.
    </li>
  </ul>
{/snippet}

{#snippet stepRedirects()}
  <p class="text-muted-foreground">
    Old bookmarks like
    <code class="bg-muted rounded px-1.5 py-0.5 text-sm">openshock.app/#/dashboard/home</code>
    forward automatically. Nothing for you to do.
  </p>
  <p class="text-muted-foreground mt-4">
    The legacy site stays online during the transition. We'll announce a sunset date once the new
    site has full feature parity.
  </p>
{/snippet}

{#snippet stepFeedback()}
  <p class="text-muted-foreground">
    Something broken or missing? Tell us on Discord or open an issue on GitHub. The faster you
    report it, the faster we can fix it.
  </p>
  <p class="text-muted-foreground mt-4">
    Lots more is landing soon. Thanks for sticking with us.
  </p>
{/snippet}
