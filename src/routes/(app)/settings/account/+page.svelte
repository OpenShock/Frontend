<script lang="ts">
  import Bug from '@lucide/svelte/icons/bug';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import Mail from '@lucide/svelte/icons/mail';
  import User from '@lucide/svelte/icons/user';
  import { PUBLIC_SIGNOZ_LOGS_ENABLED } from '$env/static/public';
  import Container from '$core/components/Container.svelte';
  import { Button } from '$hadcn/button';
  import { ToggleGroup, ToggleGroupItem } from '$hadcn/toggle-group';
  import {
    telemetryConsent,
    telemetryPrompted,
    type TelemetryLevel,
  } from '$lib/state/telemetry-consent-state.svelte';
  import { initTelemetry } from '$lib/telemetry/logger';
  import { userState } from '$lib/state/user-state.svelte';
  import ChangeEmailDialog from './dialog-email-change.svelte';
  import ChangePasswordDialog from './dialog-password-change.svelte';
  import ChangeUsernameDialog from './dialog-username-change.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import DangerZone from './DangerZone.svelte';

  const errorReportingAvailable = PUBLIC_SIGNOZ_LOGS_ENABLED === 'true';

  const telemetryOptions: { value: TelemetryLevel; label: string; description: string }[] = [
    { value: 'off', label: 'Off', description: 'Send nothing.' },
    { value: 'errors', label: 'Errors', description: 'Send browser error reports only.' },
    {
      value: 'full',
      label: 'Full',
      description: 'Error reports plus traces of API calls (no page navigations).',
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
    { label: 'Settings', href: '/settings/account' },
    { label: 'Account' },
  ]);

  let account = $derived(userState.self);
  let isOAuthOnly = $derived(account ? !account.hasPassword : false);

  let usernameDialogOpen = $state(false);
  let emailDialogOpen = $state(false);
  let passwordDialogOpen = $state(false);
</script>

{#if account}
  <Container>
    <div
      class="bg-card border-border flex w-full flex-col items-start gap-y-6 rounded-lg border p-6"
    >
      <h1 class="text-xl font-bold">Account Settings</h1>

      <div class="flex w-full items-center gap-2">
        <div class="grow">
          <div class="flex items-center gap-2 font-medium">
            <User />
            Username
          </div>
          <div class="text-muted-foreground">{account.name}</div>
        </div>
        <Button type="button" onclick={() => (usernameDialogOpen = true)}>Change Username</Button>
      </div>

      <div class="flex w-full items-center gap-2">
        <div class="grow">
          <div class="flex items-center gap-2 font-medium">
            <Mail />
            Email
          </div>
          <div class="text-muted-foreground">{account.email}</div>
        </div>
        <Button
          type="button"
          disabled={isOAuthOnly}
          title={isOAuthOnly ? 'Not available for OAuth-only accounts' : undefined}
          onclick={() => (emailDialogOpen = true)}
        >
          Change Email
        </Button>
      </div>

      <div class="flex w-full items-center gap-2">
        <div class="grow">
          <div class="flex items-center gap-2 font-medium">
            <KeyRound />
            Password
          </div>
          {#if isOAuthOnly}
            <div class="text-muted-foreground text-sm">
              This account signs in via OAuth and has no password.
            </div>
          {/if}
        </div>
        <Button
          type="button"
          disabled={isOAuthOnly}
          title={isOAuthOnly ? 'Not available for OAuth-only accounts' : undefined}
          onclick={() => (passwordDialogOpen = true)}
        >
          Change Password
        </Button>
      </div>

      {#if errorReportingAvailable}
        <div class="flex w-full flex-col gap-2">
          <div class="flex w-full items-center gap-2">
            <div class="grow">
              <div class="flex items-center gap-2 font-medium">
                <Bug />
                Diagnostics
              </div>
              <div class="text-muted-foreground text-sm">
                Help us fix crashes and slow API calls. Reports include the error message, stack
                trace and your IP. Off by default. {telemetryDescription}
              </div>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={telemetryConsent.value}
              onValueChange={onTelemetryLevelChange}
              aria-label="Diagnostics level"
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
  Loading...
{/if}
