<script lang="ts">
  import Mail from '@lucide/svelte/icons/mail';
  import { accountV1Api } from '$lib/api';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { UserStore } from '$lib/stores/UserStore';
  import type { ApiUserSelf } from '$lib/types/ApiUser';
  import { toast } from 'svelte-sonner';

  interface Props {
    account: ApiUserSelf;
  }

  let { account }: Props = $props();

  let loading = $state(false);

  let email = $state<string>('');
  let emailValid = $state(false);

  async function submitEmail(e: Event) {
    e.preventDefault();
    if (loading) return;
    loading = true;

    try {
      await accountV1Api.authenticatedAccountChangeEmail({ email });

      toast.success('Email changed successfully');

      UserStore.setSelfEmail(email);

      email = '';
    } catch (e) {
      await handleApiError(e);
    } finally {
      loading = false;
    }
  }
</script>

<EmailInput
  label="Email"
  placeholder={account.email}
  autocomplete="off"
  bind:value={email}
  bind:valid={emailValid}
  Icon={Mail}
>
  {#snippet after()}
    <Button
      type="button"
      onclick={submitEmail}
      disabled={!emailValid || email === account.email || loading}
    >
      Change
    </Button>
  {/snippet}
</EmailInput>
