<script lang="ts">
  import RowActions from '#lib/components/Table/RowActions.svelte';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { Copy } from '@lucide/svelte';
  import type { OnlineGateway } from './columns';

  interface Props {
    gateway: OnlineGateway;
  }

  let { gateway }: Props = $props();

  const copyId = () => copyToClipboard(gateway.id, 'Gateway copied to clipboard');
  const copyEndpoint = () => copyToClipboard(gateway.endpoint, 'Endpoint copied to clipboard');
  const copyCoordinates = () =>
    gateway.coordinates && copyToClipboard(gateway.coordinates, 'Coordinates copied to clipboard');
</script>

<RowActions
  label="Gateway"
  actions={[
    { label: 'Copy Gateway', icon: Copy, onclick: copyId },
    { label: 'Copy Endpoint', icon: Copy, onclick: copyEndpoint },
    {
      label: 'Copy Coordinates',
      icon: Copy,
      onclick: copyCoordinates,
      disabled: !gateway.coordinates,
    },
  ]}
/>
