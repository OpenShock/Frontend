<script lang="ts">
  import { TableActionMenu } from '@openshock/svelte-core/components';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
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

<TableActionMenu>
  <DropdownMenu.Label>Gateway</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      Copy Gateway
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={copyEndpoint}>
      <Copy class="size-4" />
      Copy Endpoint
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class={gateway.coordinates ? 'cursor-pointer' : undefined}
      disabled={!gateway.coordinates}
      onclick={copyCoordinates}
    >
      <Copy class="size-4" />
      Copy Coordinates
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>
