<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import ChangeEmail from './ChangeEmail.svelte';
  import ChangePassword from './ChangePassword.svelte';
  import ChangeUsername from './ChangeUsername.svelte';
  import { breadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import DangerZone from './DangerZone.svelte';

  breadcrumbs.push('Settings', '/settings/account');
  breadcrumbs.push('Account');

  let account = $derived(userState.self);
</script>

{#if account}
  <Container>
    <div
      class="bg-surface-100-800-token flex w-full flex-col items-start gap-y-2 rounded-lg border border-gray-500 p-4"
    >
      <h1 class="text-xl font-bold">Account Settings</h1>

      <ChangeUsername {account} />
      <ChangeEmail {account} />
      <ChangePassword />
      <DangerZone />
    </div>
  </Container>
{:else}
  Loading...
{/if}
