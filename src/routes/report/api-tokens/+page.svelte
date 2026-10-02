<script lang="ts" module>
  function isValid(str: string): boolean {
    return /^[0-9a-zA-Z]{32,64}$/i.test(str);
  }
</script>

<script lang="ts">
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

  registerBreadcrumbs(() => [{ label: 'Report API Tokens', href: 'report/api-tokens' }]);

  let secrets = $state<string[]>([]);
  let turnstileResponse = $state<string | null>(null);
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
      toast.error(`Failed to read clipboard: ${err}`);
    }
  }
</script>

<Container class="max-w-3xl space-y-6">
  <Card.Header>
    <Card.Title class="flex items-center justify-between text-3xl font-semibold">
      Report Leaked API Tokens
      <Button onclick={pasteFromClipboard} size="sm" variant="outline">Paste from clipboard</Button>
    </Card.Title>
  </Card.Header>

  <Card.Content class="space-y-5">
    <!-- Warning Message -->
    <div
      class="border-destructive bg-destructive/10 flex items-start gap-3 rounded-md border-l-4 p-4"
    >
      <OctagonAlert class="text-destructive" />
      <p class="text-destructive text-sm leading-snug">
        <strong>This form is only for reporting accidentally leaked API tokens.</strong><br />
        <u>Intentional abuse will result in bans or severe endpoint restrictions.</u>
      </p>
    </div>

    <!-- Token Preview -->
    <span class="text-muted-foreground mb-2 block text-sm font-medium">Detected Tokens</span>
    <ScrollArea class="bg-muted h-48 rounded-md border p-3">
      {#each secrets as secret (secret)}
        <p
          class="mb-1 rounded px-2 py-1 font-mono text-sm break-all
                {isValid(secret)
            ? 'bg-success/15 text-success'
            : 'bg-destructive/15 text-destructive'}"
        >
          {secret}
        </p>
      {/each}
    </ScrollArea>
    {#if !isAllValid}
      <div
        class="border-destructive/40 bg-destructive/10 text-destructive mt-2 flex items-start gap-2 rounded-md border p-3 text-sm"
      >
        <span> One or more tokens appear to be invalid. Please check for formatting issues. </span>
      </div>
    {/if}

    <!-- Turnstile + Acknowledgement -->
    <div class="space-y-3">
      <Turnstile action="report-token" onResponse={(response) => (turnstileResponse = response)} />

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
          I confirm I understand what this feature is for and accept responsibility.
        </Label>
      </div>
    </div>

    <!-- Submit -->
    <Button onclick={handleSubmit} disabled={!canSubmit} class="w-full">Submit Report</Button>
  </Card.Content>
</Container>
