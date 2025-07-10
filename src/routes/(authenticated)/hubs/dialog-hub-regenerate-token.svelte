<script lang="ts">
  import { hubManagementV1Api } from '$lib/api';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Content, Description, Dialog, Header, Title } from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { Hub } from './columns';

  interface Props {
    open: boolean;
    hub: Hub;
  }

  let { open = $bindable<boolean>(), hub }: Props = $props();

  let loading = $state<boolean>(false);
  let newToken = $state<string | null>(null);

  async function regenerateToken() {
    loading = true;
    try {
      newToken = await hubManagementV1Api.devicesRegenerateDeviceToken(hub.id);
    } catch (e) {
      handleApiError(e);
    } finally {
      loading = false;
    }
  }
  function setOpen(o: boolean) {
    open = o;
    if (!o) {
      newToken = null;
    }
  }
</script>

<Dialog bind:open={() => open, setOpen}>
  <Content>
    <Header>
      <Title>{loading ? 'Generating...' : newToken ? 'Token generated' : 'Are you sure?'}</Title>
      {#if !loading}
        <Description>
          {#if newToken}
            New token generated for <strong>{hub.name}</strong><br />
            The code below will not be accessible later, please copy it now and update clients with it
          {:else}
            You are about to regenerate the token for <strong>{hub.name}</strong><br />
            This action will invalidate the current token and disconnect clients using it<br />
            Are you sure you want to do this?<br />
          {/if}
        </Description>
      {/if}
    </Header>
    {#if !loading}
      {#if newToken}
        <div>
          <strong class="text-sm text-muted-foreground font-medium">New token:</strong>
          <CopyInput value={newToken} />
        </div>
        <Button onclick={() => setOpen(false)}>Code has been copied, close</Button>
      {:else}
        <Button onclick={regenerateToken}>Regenerate Token</Button>
      {/if}
    {/if}
  </Content>
</Dialog>
