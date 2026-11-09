<script lang="ts">
  import Languages from '@lucide/svelte/icons/languages';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { m } from '#lib/paraglide/messages.js';
  import { localeOverride } from '#lib/i18n/query-locale.js';
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

  // setLocale saves the choice and reloads the page.
  // Picking the language a `?lang=` link set is not a change, but it still saves it and drops the parameter.
  function select(locale: Locale) {
    if (locale !== current || localeOverride !== undefined) setLocale(locale);
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
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
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Label>{m.footer_language_label()}</DropdownMenu.Label>
    <DropdownMenu.RadioGroup value={current}>
      {#each locales as locale (locale)}
        <DropdownMenu.RadioItem value={locale} lang={locale} onSelect={() => select(locale)}>
          {nativeName(locale)}
        </DropdownMenu.RadioItem>
      {/each}
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>
