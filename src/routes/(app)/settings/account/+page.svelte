<script lang="ts">
  import KeyRound from '@lucide/svelte/icons/key-round';
  import Mail from '@lucide/svelte/icons/mail';
  import User from '@lucide/svelte/icons/user';
  import Container from '$lib/components/Container.svelte';
  import { Button } from '$lib/components/ui/button';
  import { userState } from '$lib/state/user-state.svelte';
  import ChangeEmailDialog from './dialog-email-change.svelte';
  import ChangePasswordDialog from './dialog-password-change.svelte';
  import ChangeUsernameDialog from './dialog-username-change.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import DangerZone from './DangerZone.svelte';

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
      class="bg-surface-100-800-token flex w-full flex-col items-start gap-y-6 rounded-lg border border-gray-500 p-4"
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

      <ChangeUsernameDialog bind:open={usernameDialogOpen} {account} />
      <ChangeEmailDialog bind:open={emailDialogOpen} {account} />
      <ChangePasswordDialog bind:open={passwordDialogOpen} />

      <DangerZone />
    </div>
  </Container>
{:else}
  Loading...
{/if}
