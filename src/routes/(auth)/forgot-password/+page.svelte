<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { accountPasswordResetInitiateV2 } from '#lib/api/index.js';
  import Turnstile from '#lib/components/Turnstile.svelte';
  import { EmailInput } from '@openshock/svelte-core/components/input';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Field, FieldDescription } from '@openshock/svelte-core/components/ui/field';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { backendMetadata } from '#lib/state/backend-metadata-state.svelte.js';
  import { toast } from 'svelte-sonner';
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';

  registerBreadcrumbs(() => [{ label: m.auth_forgot_breadcrumb() }]);

  // Without a mail provider the reset link can never be delivered, so the flow is unavailable.
  let mailEnabled = $derived(backendMetadata.state?.isMailEnabled ?? true);

  let email = $state<string>('');
  let emailValid = $state(false);

  let turnstileResponse = $state<string | null>(null);
  let turnstile = $state<Turnstile>();

  function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!email || !turnstileResponse) {
      return;
    }

    accountPasswordResetInitiateV2({ body: { email, turnstileResponse } })
      .then(() => {
        toast.success(m.auth_forgot_toast_sent());
        goto(resolve('login'));
      })
      .catch((error) => {
        turnstile?.reset();
        return handleApiError(error);
      });
  }

  let canSubmit = $derived(emailValid && turnstileResponse != null);
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl"><h1>{m.auth_forgot_title()}</h1></Card.Title>
    <Card.Description>{m.auth_forgot_description()}</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if mailEnabled}
      <form class="flex flex-col gap-4" onsubmit={handleSubmission}>
        <EmailInput
          label={m.auth_forgot_email_label()}
          placeholder={m.auth_forgot_email_placeholder()}
          autocomplete="off"
          bind:value={email}
          bind:valid={emailValid}
        />

        <Turnstile
          bind:this={turnstile}
          action="forgot-password"
          onResponse={(response) => (turnstileResponse = response)}
        />

        <Field class="mt-1">
          <Button type="submit" disabled={!canSubmit}>{m.auth_forgot_submit()}</Button>
          <FieldDescription class="text-center">
            <ParaglideMessage message={m.auth_forgot_signin_prompt}>
              {#snippet signin({ children })}
                <a href={resolve('login')}>{@render children?.()}</a>
              {/snippet}
            </ParaglideMessage>
          </FieldDescription>
        </Field>
      </form>
    {:else}
      <div class="flex flex-col gap-4">
        <p class="text-muted-foreground text-center text-sm">
          {m.auth_forgot_mail_disabled()}
        </p>
        <Field class="mt-1">
          <FieldDescription class="text-center">
            <ParaglideMessage message={m.auth_forgot_signin_prompt}>
              {#snippet signin({ children })}
                <a href={resolve('login')}>{@render children?.()}</a>
              {/snippet}
            </ParaglideMessage>
          </FieldDescription>
        </Field>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
