<script lang="ts">
  import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { apiTokensApi } from '$lib/api';
  import Turnstile from '$lib/components/Turnstile.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  function isValid(str: string): boolean {
    return /^[0-9a-zA-Z]{32,64}$/i.test(str);
  }

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
      await apiTokensApi.tokensReportTokens({ turnstileResponse, secrets });
      goto(resolve('/login'));
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

<div class="max-w-3xl mx-auto my-10 space-y-6 px-4">
  <Card.Header>
    <Card.Title class="text-3xl font-semibold flex justify-between items-center">
      Report Leaked API Tokens
      <Button onclick={pasteFromClipboard} size="sm" variant="outline">Paste from clipboard</Button>
    </Card.Title>
  </Card.Header>

  <Card.Content class="space-y-5">
    <!-- Warning Message -->
    <div class="flex items-start gap-3 p-4 border-l-4 border-red-500 bg-red-50 rounded-md">
      <OctagonAlert class="text-red-600" />
      <p class="text-sm text-red-800 leading-snug">
        <strong>This form is only for reporting accidentally leaked API tokens.</strong><br />
        <u>Intentional abuse will result in bans or severe endpoint restrictions.</u>
      </p>
    </div>

    <!-- Token Preview -->
    <span class="block text-sm font-medium text-gray-700 mb-2">Detected Tokens</span>
    <ScrollArea class="h-48 border rounded-md p-3 bg-gray-50">
      {#each secrets as secret}
        <p
          class="text-sm font-mono break-all px-2 py-1 mb-1 rounded
                {isValid(secret) ? 'bg-green-200 text-gray-800' : 'bg-red-200 text-red-700'}"
        >
          {secret}
        </p>
      {/each}
    </ScrollArea>
    {#if !isAllValid}
      <div
        class="mt-2 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-md"
      >
        <span> One or more tokens appear to be invalid. Please check for formatting issues. </span>
      </div>
    {/if}

    <!-- Turnstile + Acknowledgement -->
    <div class="space-y-3">
      <Turnstile action="report-token" bind:response={turnstileResponse} />
      <div class="flex items-center space-x-2">
        <Checkbox
          id="acknowledgement"
          bind:checked={acknowledgement}
          aria-labelledby="acknowledgement-label"
        />
        <Label
          id="acknowledgement-label"
          for="acknowledgement"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I confirm I understand what this feature is for and accept responsibility.
        </Label>
      </div>
    </div>

    <!-- Submit -->
    <Button onclick={handleSubmit} disabled={!canSubmit} class="w-full">Submit Report</Button>
  </Card.Content>
</div>
