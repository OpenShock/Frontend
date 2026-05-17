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
  import { PUBLIC_DISCORD_INVITE_URL, PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import DiscordLogo from '$lib/components/svg/DiscordLogo.svelte';
  import GithubIcon from '$lib/components/svg/GithubIcon.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { onMount, type Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  interface Step {
    title: string;
    body: Snippet;
  }

  const steps: Step[] = [
    { title: 'Welcome to the new OpenShock', body: stepWelcome },
    { title: "What's new", body: stepFeatures },
    { title: 'Bookmarks still work', body: stepRedirects },
    { title: 'Found a bug?', body: stepFeedback },
  ];

  let open = $state(false);
  let step = $state(0);
  let reducedMotion = $state(false);
  let stepDirection = $state(1);
  let mouseX = $state(-9999);
  let mouseY = $state(-9999);

  onMount(() => {
    if (!shouldShow()) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mq.matches;
    const onChange = (e: MediaQueryListEvent) => (reducedMotion = e.matches);
    mq.addEventListener('change', onChange);

    open = true;

    return () => mq.removeEventListener('change', onChange);
  });

  function goTo(i: number) {
    if (i < 0 || i >= steps.length || i === step) return;
    stepDirection = i > step ? 1 : -1;
    step = i;
  }

  function goNext() {
    if (step === steps.length - 1) return dismiss();
    goTo(step + 1);
  }

  function goPrev() {
    if (step === 0) return;
    goTo(step - 1);
  }

  function dismiss() {
    markWelcomed();
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') dismiss();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
    else if (e.key === 'ArrowLeft') goPrev();
  }

  let rafPending = false;
  function handlePointerMove(e: PointerEvent) {
    if (reducedMotion || !open) return;
    const { clientX, clientY } = e;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      mouseX = clientX;
      mouseY = clientY;
      rafPending = false;
    });
  }

  let isFirst = $derived(step === 0);
  let isLast = $derived(step === steps.length - 1);
</script>

<svelte:window onkeydown={handleKeydown} onpointermove={handlePointerMove} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex select-none items-center justify-center overflow-hidden bg-[#08080c]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="welcome-title"
    tabindex="-1"
  >
    <!-- Background: base dot grid + brighter spotlight grid masked around the cursor -->
    <div class="bg-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
    <div
      class="bg-grid-spotlight pointer-events-none absolute inset-0"
      style:--mouse-x="{mouseX}px"
      style:--mouse-y="{mouseY}px"
      aria-hidden="true"
    ></div>

    <!-- Stories-style segmented progress along the top edge. Pure indicator, no auto-advance. -->
    <div class="absolute top-4 right-6 left-6 flex gap-1.5" aria-label="Progress">
      {#each steps as _, i (i)}
        <button
          type="button"
          aria-label="Go to step {i + 1}"
          onclick={() => goTo(i)}
          class="h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/15 transition hover:bg-white/25"
        >
          <span
            class="block h-full origin-left rounded-full bg-white/90 transition-transform duration-500"
            style:transform={i <= step ? 'scaleX(1)' : 'scaleX(0)'}
          ></span>
        </button>
      {/each}
    </div>

    <div class="relative flex h-full w-full max-w-4xl flex-col px-6 py-16 sm:px-10">
      <div class="flex flex-1 flex-col justify-center overflow-hidden">
        {#key step}
          <div
            class="flex flex-col"
            in:fly={{
              x: reducedMotion ? 0 : 40 * stepDirection,
              duration: reducedMotion ? 0 : 350,
              easing: cubicOut,
              opacity: 0,
            }}
          >
            {#if isFirst}
              <h1 id="welcome-title" class="sr-only">Welcome to OpenShock</h1>
            {:else}
              <p class="mb-2 text-xs tracking-widest text-white/50 uppercase">
                Step {step + 1} of {steps.length}
              </p>
              <h1 id="welcome-title" class="mb-6 text-3xl font-bold text-white sm:text-4xl">
                {steps[step].title}
              </h1>
            {/if}
            <div class="text-base leading-relaxed text-white/80">
              {@render steps[step].body()}
            </div>
          </div>
        {/key}
      </div>

      <div class="mt-10 flex flex-none flex-col gap-6">
        <div class="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="lg"
            class="text-white/70 hover:bg-white/10 hover:text-white"
            onclick={dismiss}
          >
            Skip
          </Button>
          <div class="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              class="w-32 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white {isFirst
                ? 'pointer-events-none opacity-0'
                : ''}"
              aria-hidden={isFirst}
              tabindex={isFirst ? -1 : 0}
              onclick={goPrev}
            >
              <ChevronLeft />
              Back
            </Button>
            <Button
              size="lg"
              class="w-44 bg-white text-black shadow-lg shadow-white/10 hover:bg-white/90"
              onclick={goNext}
            >
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
    <p
      class="text-3xl font-semibold tracking-wide sm:text-4xl"
      style="color: #ff6f8d"
      in:fade={{ duration: 600, delay: 100 }}
    >
      Welcome to the new
    </p>

    <img
      class="my-8 w-full max-w-3xl sm:my-12"
      src={asset('/logo.svg')}
      alt="OpenShock"
      draggable="false"
      in:fade={{ duration: 700, delay: 200 }}
    />

    <p
      class="text-3xl font-semibold tracking-wide sm:text-4xl"
      style="color: #ff6f8d"
      in:fade={{ duration: 600, delay: 300 }}
    >
      frontend
    </p>

    <p class="mt-10 max-w-md text-base text-white/60 sm:text-lg" in:fade={{ duration: 600, delay: 500 }}>
      Take the quick tour, or skip ahead and dive in.
    </p>
  </div>
{/snippet}

{#snippet stepFeatures()}
  <p class="mb-6 text-white/70">
    Over <span class="font-semibold text-white">2 years</span> of work. Faster, fully
    mobile-friendly, and a much better base for everything we want to build next.
  </p>
  <ul class="grid gap-3 sm:grid-cols-2">
    {#each [{ t: 'Reworked shocker dashboard', d: 'Groundwork for customizable layouts.' }, { t: 'Web Terminal', d: 'Configure your hub and flash firmware straight from the browser. No installs.' }, { t: 'OAuth sign-in', d: 'Log in with accounts you already have.' }, { t: 'Better sharing', d: 'Public links, user shares, invite tracking, and per-shocker shortcuts.' }] as item, i (item.t)}
      <li
        class="rounded-xl border border-white/10 bg-[#13131a] p-4 transition hover:border-white/20 hover:bg-[#181821]"
        in:fly={{ y: 14, duration: 400, delay: 80 * i, easing: cubicOut }}
      >
        <div class="font-semibold text-white">{item.t}</div>
        <div class="mt-1 text-sm text-white/60">{item.d}</div>
      </li>
    {/each}
  </ul>
{/snippet}

{#snippet stepRedirects()}
  <p>
    Old bookmarks like
    <code class="rounded bg-white/10 px-1.5 py-0.5 text-sm text-white">
      openshock.app/#/dashboard/home
    </code>
    forward automatically. Nothing for you to do.
  </p>
  <p class="mt-4">
    The legacy site stays online during the transition. We'll announce a sunset date once the new
    site has full feature parity.
  </p>
{/snippet}

{#snippet stepFeedback()}
  <p>
    Something broken or missing? The faster you report it, the faster we can fix it.
  </p>

  <div class="mt-8 grid gap-3 sm:grid-cols-2">
    <a
      href={PUBLIC_DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#13131a] p-4 transition hover:border-[#5865F2]/60 hover:bg-[#1a1b2e]"
    >
      <div
        class="flex size-12 flex-none items-center justify-center rounded-lg bg-[#5865F2]/15 transition group-hover:bg-[#5865F2]/25"
      >
        <DiscordLogo class="size-6 fill-[#5865F2]" />
      </div>
      <div class="min-w-0">
        <div class="font-semibold text-white">Discord</div>
        <div class="truncate text-sm text-white/60">Chat with the community</div>
      </div>
    </a>

    <a
      href={PUBLIC_GITHUB_PROJECT_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#13131a] p-4 transition hover:border-white/30 hover:bg-[#181821]"
    >
      <div
        class="flex size-12 flex-none items-center justify-center rounded-lg bg-white/10 transition group-hover:bg-white/15"
      >
        <GithubIcon class="size-6 fill-white" />
      </div>
      <div class="min-w-0">
        <div class="font-semibold text-white">GitHub</div>
        <div class="truncate text-sm text-white/60">Open an issue</div>
      </div>
    </a>
  </div>

  <p class="mt-6 text-sm text-white/50">
    Lots more is landing soon. Thanks for sticking with us.
  </p>
{/snippet}

<style>
  /* Base dot grid (subtle, full-bleed) */
  .bg-grid {
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size: 28px 28px;
    background-position: center center;
  }

  /* Brighter "spotlight" copy of the same grid, masked to a circle around
     the cursor. Small mask radius keeps any alpha banding imperceptible. */
  .bg-grid-spotlight {
    background-image:
      radial-gradient(circle, rgba(225, 74, 109, 0.9) 1px, transparent 1px);
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
