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
  let code = $state<string | null>(null);

  async function generatePairCode() {
    loading = true;
    try {
      const thing = await hubManagementV1Api.devicesGetPairCode(hub.id);
      code = thing.data;
    } catch (error) {
      await handleApiError(error);
    } finally {
      loading = false;
    }
  }
  function setOpen(o: boolean) {
    open = o;
    if (!o) {
      code = null;
    }
  }
</script>

<Dialog bind:open={() => open, setOpen}>
  <Content>
    <Header>
      <Title
        >{loading ? 'Generating...' : code ? 'Pair code generated' : 'Generate pair code?'}</Title
      >
      {#if !loading}
        <Description>
          {#if code}
            Pair code generated for <strong>{hub.name}</strong><br />
            The code below will not be accessible later, please copy it now and update clients with it
          {:else}
            You are about to generate a pair code for <strong>{hub.name}</strong><br />
            It will be vaild for 15 minutes after its creation.<br />
            There is only one active pair code per hub, newly generated ones will override the older active
            ones.<br />
          {/if}
        </Description>
      {/if}
    </Header>
    {#if !loading}
      {#if code}
        <div>
          <strong class="text-muted-foreground text-sm font-medium">New token:</strong>
          <CopyInput value={code} />
        </div>
        <Button onclick={() => setOpen(false)}>Code has been copied, close</Button>
      {:else}
        <Button onclick={generatePairCode}>Get Pair Code</Button>
      {/if}
    {/if}
  </Content>
</Dialog>
