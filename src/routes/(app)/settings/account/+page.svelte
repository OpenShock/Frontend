<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import Bug from '@lucide/svelte/icons/bug';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import Mail from '@lucide/svelte/icons/mail';
  import User from '@lucide/svelte/icons/user';
  import { PUBLIC_SIGNOZ_LOGS_ENABLED } from '$app/env/public';
  import { Container, PageHeader, PageLoading } from '@openshock/svelte-core/components';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { ToggleGroup, ToggleGroupItem } from '@openshock/svelte-core/components/ui/toggle-group';
  import {
    telemetryConsent,
    telemetryPrompted,
    type TelemetryLevel,
  } from '#lib/state/telemetry-consent-state.svelte.js';
  import { initTelemetry } from '#lib/telemetry/logger.js';
  import { userState } from '#lib/state/user-state.svelte.js';
  import ChangeEmailDialog from './dialog-email-change.svelte';
  import ChangePasswordDialog from './dialog-password-change.svelte';
  import ChangeUsernameDialog from './dialog-username-change.svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import DangerZone from './DangerZone.svelte';

  const telemetryOptions: { value: TelemetryLevel; label: string; description: string }[] = [
    { value: 'off', label: m.account_telemetry_off(), description: m.account_telemetry_off_desc() },
    {
      value: 'errors',
      label: m.account_telemetry_errors(),
      description: m.account_telemetry_errors_desc(),
    },

    {
      value: 'full',
      label: m.account_telemetry_full(),
      description: m.account_telemetry_full_desc(),
    },
  ];

  function onTelemetryLevelChange(value: string | undefined) {
    // ToggleGroup (single) can emit undefined when the active item is toggled off; keep current.
    if (value !== 'off' && value !== 'errors' && value !== 'full') return;
    telemetryConsent.value = value;
    // Configuring it here counts as being asked — don't also show the first-time prompt.
    telemetryPrompted.value = true;
    // Opting up takes effect immediately; downgrading/disabling takes effect on next reload.
    initTelemetry();
  }

  let telemetryDescription = $derived(
    telemetryOptions.find((o) => o.value === telemetryConsent.value)?.description ?? ''
  );

  registerBreadcrumbs(() => [
    { label: m.sidebar_group_settings(), href: 'settings/account' },
    { label: m.settings_breadcrumb_account() },
  ]);

  let account = $derived(userState.self);
  let isOAuthOnly = $derived(account ? !account.hasPassword : false);

  let usernameDialogOpen = $state(false);
  let emailDialogOpen = $state(false);
  let passwordDialogOpen = $state(false);
</script>

{#if account}
  <Container>
    <PageHeader title={m.sidebar_settings_account()} subtitle={m.account_subtitle()} />
    <div
      class="bg-card border-border flex w-full flex-col items-start gap-y-6 rounded-lg border p-6"
    >
      <div class="flex w-full items-center gap-2">
        <div class="grow">
          <div class="flex items-center gap-2 font-medium">
            <User />
            {m.account_username_label()}
          </div>
          <div class="text-muted-foreground">{account.name}</div>
        </div>

        <Button type="button" variant="outline" onclick={() => (usernameDialogOpen = true)}>
          {m.account_change_username()}
        </Button>
      </div>

      <div class="flex w-full items-center gap-2">
        <div class="grow">
          <div class="flex items-center gap-2 font-medium">
            <Mail />
            {m.account_email_label()}
          </div>
          <div class="text-muted-foreground">{account.email}</div>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isOAuthOnly}
          title={isOAuthOnly ? m.account_oauth_only() : undefined}
          onclick={() => (emailDialogOpen = true)}>{m.account_change_email()}</Button
        >
      </div>

      <div class="flex w-full items-center gap-2">
        <div class="grow">
          <div class="flex items-center gap-2 font-medium">
            <KeyRound />
            {m.account_password_label()}
          </div>
          {#if isOAuthOnly}
            <div class="text-muted-foreground text-sm">
              {m.account_oauth_no_password()}
            </div>
          {/if}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isOAuthOnly}
          title={isOAuthOnly ? m.account_oauth_only() : undefined}
          onclick={() => (passwordDialogOpen = true)}>{m.account_change_password()}</Button
        >
      </div>

      {#if PUBLIC_SIGNOZ_LOGS_ENABLED}
        <div class="flex w-full flex-col gap-2">
          <div class="flex w-full items-center gap-2">
            <div class="grow">
              <div class="flex items-center gap-2 font-medium">
                <Bug />
                {m.account_diagnostics()}
              </div>
              <div class="text-muted-foreground text-sm">
                {m.account_diagnostics_desc()}
                {telemetryDescription}
              </div>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={telemetryConsent.value}
              onValueChange={onTelemetryLevelChange}
              aria-label={m.account_diagnostics_level()}
            >
              {#each telemetryOptions as option (option.value)}
                <ToggleGroupItem value={option.value} aria-label={option.label}>
                  {option.label}
                </ToggleGroupItem>
              {/each}
            </ToggleGroup>
          </div>
        </div>
      {/if}

      <ChangeUsernameDialog bind:open={usernameDialogOpen} {account} />
      <ChangeEmailDialog bind:open={emailDialogOpen} {account} />
      <ChangePasswordDialog bind:open={passwordDialogOpen} />

      <DangerZone />
    </div>
  </Container>
{:else}
  <PageLoading />
{/if}
