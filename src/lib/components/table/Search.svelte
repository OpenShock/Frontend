<script lang="ts">
  import type { TableHandler } from '@vincjo/datatables';
  interface Props {
    handler: TableHandler;
  }

  let { handler }: Props = $props();
  let value: string = $state('');
</script>

<input
  class="input sm:w-64 w-36"
  type="search"
  placeholder="Search..."
  bind:value
  oninput={() => handler.search(value)}
/>
