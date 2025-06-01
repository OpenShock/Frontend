<script lang="ts">
  import { Mail } from '@lucide/svelte';
  import EmailInput from '$lib/components/input/EmailInput.svelte';
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
  button={{ text: 'Change', submits: true, onClick: submitEmail }}
/>
