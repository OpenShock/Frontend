<script lang="ts">
  import Languages from '@lucide/svelte/icons/languages';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import Check from '@lucide/svelte/icons/check';
  import { m } from '#lib/paraglide/messages.js';
  import LocaleFlag from './LocaleFlag.svelte';
  import { getLocale, locales, setLocale, type Locale } from '#lib/paraglide/runtime.js';

  const current = getLocale();

  // Each language is named in itself, so users can find theirs whatever the page is in.
  function nativeName(locale: Locale): string {
    // Not a real language, so Intl has no name for it.
    if (locale === 'uwu') return 'UwU';
    // Intl calls nb "norsk bokmål", which is longer than people expect in a language picker.
    if (locale === 'nb') return 'Norsk';
    const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
    return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
  }

  // Alphabetical by native name, with UwU last since it is not a real language.
  // A fixed collation locale keeps the server and browser order identical.
  const collator = new Intl.Collator('en');
  const sortedLocales = [...locales].sort((a, b) =>
    a === 'uwu' ? 1 : b === 'uwu' ? -1 : collator.compare(nativeName(a), nativeName(b))
  );

  // setLocale saves the choice and reloads the page.
  function select(locale: Locale) {
    if (locale !== current) setLocale(locale);
  }
</script>

<Dialog.Root>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="sm"
        class="h-5 gap-1 px-1 text-xs"
        aria-label={m.footer_language_label()}
      >
        <Languages class="size-4" />
        {nativeName(current)}
      </Button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content
    class="top-0 left-0 h-svh w-screen max-w-none translate-x-0 translate-y-0 content-start gap-6 overflow-y-auto rounded-none p-6 ring-0 sm:max-w-none sm:p-12"
  >
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Dialog.Title class="px-4 text-2xl">{m.footer_language_label()}</Dialog.Title>
      <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {#each sortedLocales as locale (locale)}
          <li>
            <Button
              variant={locale === current ? 'secondary' : 'ghost'}
              class="h-12 w-full justify-between px-4 text-base"
              lang={locale}
              aria-current={locale === current ? 'true' : undefined}
              onclick={() => select(locale)}
            >
              <span class="flex items-center gap-3">
                <LocaleFlag {locale} class="text-xl" />
                {nativeName(locale)}
              </span>
              {#if locale === current}<Check class="size-5" />{/if}
            </Button>
          </li>
        {/each}
      </ul>
    </div>
  </Dialog.Content>
</Dialog.Root>
