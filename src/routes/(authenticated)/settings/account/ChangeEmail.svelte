<script lang="ts">
  import Mail from '@lucide/svelte/icons/mail';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { ApiUserSelf } from '$lib/types/ApiUser';

  interface Props {
    account: ApiUserSelf;
  }

  let { account }: Props = $props();

  let email = $state<string>('');

  function submitEmail() {
    console.log('Submitting email');
  }
</script>

<EmailInput
  label="Email"
  placeholder={account.email}
  autocomplete="off"
  bind:value={email}
  Icon={Mail}
>
  {#snippet after()}
    <Button type="button" onclick={submitEmail} variant="ghost">Change</Button>
  {/snippet}
</EmailInput>
