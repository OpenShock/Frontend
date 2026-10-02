<script lang="ts" module>
  import type { AdminUserView } from '#lib/api/index.js';

  /**
   * The API marks `activationRequest` and `deactivation` required, but both are
   * `$ref` properties, which its schema generator cannot annotate as nullable —
   * an activated account sends `activationRequest: null`, and one that was never
   * deactivated sends `deactivation: null`. Reading the response through this
   * shape keeps those cases visible to the compiler.
   */
  type UserView = Omit<AdminUserView, 'activationRequest' | 'deactivation'> & {
    activationRequest: AdminUserView['activationRequest'] | null;
    deactivation: AdminUserView['deactivation'] | null;
  };
</script>

<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { RoleType, adminGetUserById } from '#lib/api/index.js';
  import AtSign from '@lucide/svelte/icons/at-sign';
  import Bot from '@lucide/svelte/icons/bot';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import UserPen from '@lucide/svelte/icons/user-pen';
  import UserX from '@lucide/svelte/icons/user-x';
  import { Container, EmptyState, PageHeader } from '@openshock/svelte-core/components';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { formatRelativeInstant } from '#lib/utils/datetime.js';
  import { createNowTicker } from '@openshock/svelte-core/utils';
  import SetEmailDialog from './dialog-set-email.svelte';
  import SetNameDialog from './dialog-set-name.svelte';
  import SetPasswordDialog from './dialog-set-password.svelte';
  import UserApiTokens from './user-api-tokens.svelte';
  import UserHistory from './user-history.svelte';
  import UserHubs from './user-hubs.svelte';

  const PRIVILEGED_ROLES: RoleType[] = [RoleType.Admin, RoleType.System];

  let user = $state<UserView | null>(null);
  let notFound = $state(false);
  let hasLoaded = $state(false);
  let isFetching = $state(false);

  // Bumped to force a re-fetch after a mutation.
  let refreshNonce = $state(0);

  let setNameOpen = $state(false);
  let setEmailOpen = $state(false);
  let setPasswordOpen = $state(false);

  const clock = createNowTicker();

  registerBreadcrumbs(() => [
    { label: 'Users', href: 'admin/users' },
    { label: user?.name ?? (hasLoaded ? 'Not found' : 'Loading...') },
  ]);

  $effect(() => {
    void refreshNonce; // re-run after a mutation
    const userId = page.params.userId;
    if (!userId) {
      notFound = true;
      hasLoaded = true;
      return;
    }

    isFetching = true;
    adminGetUserById({ path: { userId } })
      .then((response: UserView) => {
        user = response;
        notFound = false;
      })
      .catch((error: unknown) =>
        // A missing user is the page's own empty state, not an error toast.
        handleApiError(error, (problem) => {
          if (problem.status !== 404) return false;
          user = null;
          notFound = true;
          return true;
        })
      )
      .finally(() => {
        isFetching = false;
        hasLoaded = true;
      });
  });

  const refresh = () => refreshNonce++;

  let isActivated = $derived(user?.activatedAt !== null);
  let isDeactivated = $derived(user?.deactivation != null);
  // Both endpoints answer 409 for an account that is deactivated or not yet activated.
  let canEditCredentials = $derived(isActivated && !isDeactivated);

  let stats = $derived.by(() => {
    if (!user) return [];
    const shockers = user.hubs.reduce((sum, hub) => sum + hub.shockers.length, 0);
    return [
      { label: 'Hubs', value: user.hubs.length.toLocaleString() },
      { label: 'Shockers', value: shockers.toLocaleString() },
      { label: 'API tokens', value: user.apiTokens.length.toLocaleString() },
      { label: 'Control logs', value: user.shockerControlLogsCount.toLocaleString() },
    ];
  });

  let details = $derived.by(() => {
    if (!user) return [];
    return [
      { label: 'User ID', value: user.id, mono: true },
      { label: 'Email', value: user.email },
      { label: 'Password hash', value: user.passwordHashType },
      {
        label: 'Created',
        value: `${user.createdAt.toLocaleString()} (${formatRelativeInstant(user.createdAt, clock.current)})`,
      },
      {
        label: 'Activated',
        value:
          user.activatedAt === null
            ? 'Not activated'
            : `${user.activatedAt.toLocaleString()} (${formatRelativeInstant(user.activatedAt, clock.current)})`,
      },
    ];
  });
</script>

{#if user}
  <SetNameDialog
    bind:open={setNameOpen}
    userId={user.id}
    currentName={user.name}
    onChanged={refresh}
  />
  <SetEmailDialog
    bind:open={setEmailOpen}
    userId={user.id}
    currentEmail={user.email}
    onChanged={refresh}
  />
  <SetPasswordDialog
    bind:open={setPasswordOpen}
    userId={user.id}
    userName={user.name}
    onChanged={refresh}
  />
{/if}

<Container>
  {#if !hasLoaded}
    <div class="flex items-center gap-3 p-12">
      <Spinner class="size-5" />
      <span class="text-muted-foreground">Loading user...</span>
    </div>
  {:else if !user || notFound}
    <EmptyState icon={UserX} title="User not found" description="No user found with this ID.">
      <Button variant="outline" href={resolve('admin/users')}>Back to users</Button>
    </EmptyState>
  {:else}
    <PageHeader title={user.name} subtitle={user.email}>
      <Button
        variant="outline"
        onclick={() => (setNameOpen = true)}
        disabled={!canEditCredentials}
        title={canEditCredentials ? undefined : 'Unavailable while the account is inactive'}
      >
        <UserPen />
        Rename
      </Button>
      <Button variant="outline" onclick={() => (setEmailOpen = true)}>
        <AtSign />
        Change email
      </Button>
      <Button
        variant="outline"
        onclick={() => (setPasswordOpen = true)}
        disabled={!canEditCredentials}
        title={canEditCredentials ? undefined : 'Unavailable while the account is inactive'}
      >
        <KeyRound />
        Set password
      </Button>
      <Button variant="outline" onclick={refresh} disabled={isFetching}>
        <RotateCcw class={isFetching ? 'animate-spin' : ''} />
        Refresh
      </Button>
    </PageHeader>

    <div class="flex w-full min-w-0 flex-col gap-6">
      <div class="flex flex-wrap items-center gap-2">
        {#each user.roles as role (role)}
          <Badge variant={PRIVILEGED_ROLES.includes(role) ? 'default' : 'secondary'}>{role}</Badge>
        {/each}
        {#if user.roles.length === 0}
          <Badge variant="outline">No roles</Badge>
        {/if}
        {#if user.createdByAutomationTokenId}
          <Badge variant="outline" href={resolve('admin/automation-tokens')}>
            <Bot />
            Created by automation token
          </Badge>
        {/if}
      </div>

      {#if user.deactivation}
        {@const deactivation = user.deactivation}
        <div
          class="border-destructive/40 bg-destructive/5 flex flex-wrap items-start gap-3 rounded-lg border p-4"
        >
          <TriangleAlert class="text-destructive size-5 shrink-0" />
          <div class="flex min-w-0 flex-col gap-1 text-sm">
            <span class="font-medium">
              Deactivated {formatRelativeInstant(deactivation.deactivatedAt, clock.current)}
              by {deactivation.deactivatedBy.name}
            </span>
            <span class="text-muted-foreground">
              {#if deactivation.scheduledDeletionTime}
                Scheduled for deletion {formatRelativeInstant(
                  deactivation.scheduledDeletionTime,
                  clock.current
                )}
                ({deactivation.scheduledDeletionTime.toLocaleString()}).
              {:else}
                No deletion is scheduled.
              {/if}
            </span>
          </div>
        </div>
      {:else if user.activationRequest}
        {@const request = user.activationRequest}
        <div
          class="flex flex-wrap items-start gap-3 rounded-lg border border-orange-500/40 bg-orange-500/5 p-4"
        >
          <TriangleAlert class="size-5 shrink-0 text-orange-500" />
          <div class="flex min-w-0 flex-col gap-1 text-sm">
            <span class="font-medium">Awaiting activation</span>
            <span class="text-muted-foreground">
              Requested {formatRelativeInstant(request.createdAt, clock.current)}; the activation
              mail has been attempted {request.emailSendAttempts}
              {request.emailSendAttempts === 1 ? 'time' : 'times'}.
            </span>
          </div>
        </div>
      {/if}

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {#each stats as stat (stat.label)}
          <div class="bg-card flex min-w-0 flex-col rounded-lg border p-4">
            <span class="text-muted-foreground text-sm">{stat.label}</span>
            <span class="truncate text-2xl font-bold" title={stat.value}>{stat.value}</span>
          </div>
        {/each}
      </div>

      <Card.Root>
        <Card.Header>
          <Card.Title>Account</Card.Title>
        </Card.Header>
        <Card.Content>
          <dl class="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {#each details as detail (detail.label)}
              <div class="flex min-w-0 flex-col">
                <dt class="text-muted-foreground text-xs">{detail.label}</dt>
                <dd class="truncate text-sm {detail.mono ? 'font-mono' : ''}" title={detail.value}>
                  {detail.value}
                </dd>
              </div>
            {/each}
          </dl>
        </Card.Content>
      </Card.Root>

      <UserHubs hubs={user.hubs} />

      <UserApiTokens tokens={user.apiTokens} onChanged={refresh} />

      <UserHistory
        nameChanges={user.usersNameChanges}
        emailChanges={user.usersEmailChanges}
        passwordResets={user.passwordResets}
      />
    </div>
  {/if}
</Container>
