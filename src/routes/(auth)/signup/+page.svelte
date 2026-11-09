<script lang="ts">
  import { accountSignUpV2 } from '#lib/api/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import * as Field from '@openshock/svelte-core/components/ui/field';
  import UsernameInput from '#lib/components/input/UsernameInput.svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Turnstile from '#lib/components/Turnstile.svelte';
  import { EmailInput, PasswordInput } from '@openshock/svelte-core/components/input';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { validatePasswordMatch } from '@openshock/svelte-core/inputvalidation';
  import { toast } from 'svelte-sonner';
  import { FieldSeparator } from '@openshock/svelte-core/components/ui/field';
  import OauthButtons from '#lib/components/auth/oauth-buttons.svelte';
  import ResendActivationButton from '#lib/components/auth/resend-activation-button.svelte';
  import { ChevronLeft, Mail } from '@lucide/svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { backendMetadata } from '#lib/state/backend-metadata-state.svelte.js';
  import { Skeleton } from '@openshock/svelte-core/components/ui/skeleton';
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';

  registerBreadcrumbs(() => [{ label: m.auth_signup_breadcrumb() }]);

  let username = $state<string>('');
  let usernameValid = $state<boolean>(false);

  let email = $state('');
  let emailValid = $state(false);

  let password = $state('');
  let passwordValid = $state(false);

  let passwordConfirm = $state('');

  let turnstileResponse = $state<string | null>(null);
  let turnstile = $state<Turnstile>();

  let canSubmit = $derived(
    usernameValid &&
      emailValid &&
      passwordValid &&
      password == passwordConfirm &&
      turnstileResponse != null
  );

  let accountCreated = $state(false);

  let useEmail = $state(false);

  // Instances without a mail provider never send an activation email; the account is usable right away.
  let mailEnabled = $derived(backendMetadata.state?.isMailEnabled ?? true);

  function onOpenChange(open: boolean) {
    if (!open) {
      accountCreated = false;
      toast.success(
        mailEnabled ? m.auth_signup_toast_created_mail() : m.auth_signup_toast_created_no_mail()
      );

      goto(resolve('login'));
    }
  }

  async function handleSubmission(e: SubmitEvent) {
    e.preventDefault();

    if (!username || !email || !password || !passwordConfirm || turnstileResponse == null) {
      return;
    }

    try {
      await accountSignUpV2({
        body: { username, password, email, turnstileResponse },
      });
      accountCreated = true;
    } catch (error) {
      turnstile?.reset();
      await handleApiError(error);
    }
  }

  let oauthProviders = $derived(backendMetadata.state?.oAuthProviders ?? []);
  let anyOAuthProviders = $derived(oauthProviders.length > 0);
</script>

<Dialog.Root bind:open={() => accountCreated, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.auth_signup_dialog_title()}</Dialog.Title>
      <Dialog.Description>
        <div class="flex flex-col gap-4">
          {#if mailEnabled}
            <p>{m.auth_signup_dialog_created_mail()}</p>
            <p>{m.auth_signup_dialog_verify_then_login()}</p>
            <ResendActivationButton class="self-start px-0" />
          {:else}
            <p>{m.auth_signup_dialog_created_no_mail()}</p>
            <p>{m.auth_signup_dialog_login_now()}</p>
          {/if}

          <Button variant="default" size="sm" class="mt-4" onclick={() => goto(resolve('login'))}
            >Ok</Button
          >
        </div>
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title class="text-xl"><h1>{m.auth_signup_title()}</h1></Card.Title>
    <Card.Description>
      {#if backendMetadata.state === null}
        {m.auth_signup_loading_methods()}
      {:else if useEmail}
        {m.auth_signup_using_email()}
      {:else}
        {m.auth_signup_choose_method()}
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Field.Group>
      {#if backendMetadata.state === null}
        <Skeleton class="h-9 w-full" />
        <Skeleton class="h-1 w-full" />
        <Skeleton class="h-9 w-full" />
      {:else if useEmail || !anyOAuthProviders}
        <form onsubmit={handleSubmission}>
          <div class="my-1 flex flex-col gap-1">
            {#if anyOAuthProviders}
              <Button
                variant="ghost"
                size="sm"
                class="text-muted-foreground hover:text-foreground -mx-2 -mt-2 mb-2 w-fit gap-1"
                onclick={() => (useEmail = false)}
                ><ChevronLeft class="size-4" />{m.auth_signup_back()}</Button
              >
            {/if}

            <UsernameInput
              label={m.auth_signup_username_label()}
              placeholder={m.auth_signup_username_placeholder()}
              bind:value={username}
              bind:valid={usernameValid}
            />
            <EmailInput
              label={m.auth_signup_email_label()}
              placeholder={m.auth_signup_email_placeholder()}
              bind:value={email}
              bind:valid={emailValid}
            />
            <PasswordInput
              label={m.auth_signup_password_label()}
              placeholder={m.auth_signup_password_placeholder()}
              autocomplete="new-password"
              bind:value={password}
              bind:valid={passwordValid}
              validate
              showStrengthMeter
            />
            <PasswordInput
              label={m.auth_signup_confirm_label()}
              placeholder={m.auth_signup_confirm_placeholder()}
              autocomplete="new-password"
              bind:value={passwordConfirm}
              validate={validatePasswordMatch(passwordConfirm, password)}
            />

            <Turnstile
              bind:this={turnstile}
              action="signup"
              onResponse={(response) => (turnstileResponse = response)}
            />
          </div>
          <Field.Field class="mt-5">
            <Button type="submit" disabled={!canSubmit}>{m.auth_signup_submit()}</Button>
            <Field.Description class="text-center">
              <ParaglideMessage message={m.auth_signup_signin_prompt}>
                {#snippet signin({ children })}
                  <a href={resolve('login')}>{@render children?.()}</a>
                {/snippet}
              </ParaglideMessage>
            </Field.Description>
          </Field.Field>
        </form>
      {:else}
        {#if anyOAuthProviders}
          <OauthButtons verb="Signup" providers={oauthProviders} />
          <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card"
            >{m.auth_signup_or()}</FieldSeparator
          >
        {/if}

        <Button variant="outline" class="w-full" onclick={() => (useEmail = true)}
          ><Mail />{m.auth_signup_with_email()}</Button
        >
      {/if}
    </Field.Group>
  </Card.Content>
</Card.Root>
<Field.Description class="px-6 text-center">
  <ParaglideMessage message={m.auth_signup_legal}>
    {#snippet tos({ children })}
      <a href="https://openshock.org/tos">{@render children?.()}</a>
    {/snippet}
    {#snippet privacy({ children })}
      <a href="https://openshock.org/privacy">{@render children?.()}</a>
    {/snippet}
  </ParaglideMessage>
</Field.Description>
