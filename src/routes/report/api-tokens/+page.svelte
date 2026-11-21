<script lang="ts" module>
  function isValid(str: string): boolean {
    return /^[0-9a-zA-Z]{32,64}$/i.test(str);
  }
</script>

<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { tokensReportTokens } from '#lib/api/index.js';
  import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { Container } from '@openshock/svelte-core/components';
  import Turnstile from '#lib/components/Turnstile.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Checkbox } from '@openshock/svelte-core/components/ui/checkbox';
  import { Label } from '@openshock/svelte-core/components/ui/label';
  import { ScrollArea } from '@openshock/svelte-core/components/ui/scroll-area';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: m.report_breadcrumb(), href: 'report/api-tokens' }]);

  let secrets = $state<string[]>([]);
  let turnstileResponse = $state<string | null>(null);
  let turnstile = $state<Turnstile>();
  let acknowledgement = $state(false);
  let isAllValid = $derived(secrets.every(isValid));
  let canSubmit = $derived(
    secrets.length > 0 && isAllValid && turnstileResponse !== null && acknowledgement
  );

  async function handleSubmit() {
    if (!canSubmit || !turnstileResponse) return;

    try {
      await tokensReportTokens({ body: { turnstileResponse, secrets } });
      goto(resolve('login'));
    } catch (err) {
      turnstile?.reset();
      await handleApiError(err);
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      secrets = text
        .split(/\s|,/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } catch (err) {
      toast.error(m.report_toast_clipboard_failed({ error: String(err) }));
    }
  }
</script>

<Container class="max-w-3xl space-y-6">
  <Card.Header>
    <Card.Title class="flex items-center justify-between gap-2 text-3xl font-semibold">
      <h1>{m.report_title()}</h1>
      <Button onclick={pasteFromClipboard} size="sm" variant="outline">{m.report_paste()}</Button>
    </Card.Title>
  </Card.Header>

  <Card.Content class="space-y-5">
    <!-- Warning Message -->
    <div
      class="border-destructive bg-destructive/10 flex items-start gap-3 rounded-md border-l-4 p-4"
    >
      <OctagonAlert class="text-destructive" />
      <p class="text-foreground text-sm leading-snug">
        <strong>{m.report_warning()}</strong><br />
        <u>{m.report_abuse_warning()}</u>
      </p>
    </div>

    <!-- Token Preview -->
    <span class="text-muted-foreground mb-2 block text-sm font-medium">{m.report_detected()}</span>
    <ScrollArea class="bg-muted h-48 rounded-md border p-3">
      {#each secrets as secret (secret)}
        <p
          class="mb-1 rounded px-2 py-1 font-mono text-sm break-all
                {isValid(secret)
            ? 'bg-success/15 border-success border-l-2'
            : 'bg-destructive/15 border-destructive border-l-2'}"
        >
          {secret}
        </p>
      {/each}
    </ScrollArea>
    {#if !isAllValid}
      <div
        class="border-destructive/40 bg-destructive/10 text-foreground mt-2 flex items-start gap-2 rounded-md border p-3 text-sm"
      >
        <span>{m.report_invalid()}</span>
      </div>
    {/if}

    <!-- Turnstile + Acknowledgement -->
    <div class="space-y-3">
      <Turnstile
        bind:this={turnstile}
        action="report-token"
        onResponse={(response) => (turnstileResponse = response)}
      />

      <div class="flex items-center space-x-2">
        <Checkbox
          id="acknowledgement"
          bind:checked={acknowledgement}
          aria-labelledby="acknowledgement-label"
        />
        <Label
          id="acknowledgement-label"
          for="acknowledgement"
          class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {m.report_acknowledge()}
        </Label>
      </div>
    </div>

    <!-- Submit -->
    <Button onclick={handleSubmit} disabled={!canSubmit} class="w-full">{m.report_submit()}</Button>
  </Card.Content>
</Container>
