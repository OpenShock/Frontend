<script lang="ts">
  import { LOCALE_FLAGS } from '#lib/i18n/locale-flags.js';
  import type { Locale } from '#lib/paraglide/runtime.js';
  import { cn } from '@openshock/svelte-core/utils/shadcn.js';

  interface Props {
    locale: Locale;
    class?: string;
  }

  let { locale, class: className }: Props = $props();

  const flag = $derived(LOCALE_FLAGS[locale]);
</script>

<!-- Decorative, since the language name always sits next to it. -->
{#if 'src' in flag}
  <img
    src={flag.src}
    alt=""
    aria-hidden="true"
    class={cn('aspect-4/3 h-[0.75em] shrink-0 rounded-[2px] object-cover', className)}
  />
{:else}
  <!-- Same width as a flag, so names line up. -->
  <span aria-hidden="true" class={cn('w-[1em] shrink-0 text-center leading-none', className)}>
    <span class="text-[0.8em]">{flag.emoji}</span>
  </span>
{/if}
