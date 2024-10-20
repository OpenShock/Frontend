<script lang="ts">
  import type { TableHandler } from '@vincjo/datatables';
  interface Props {
    handler: TableHandler;
  }

  let { handler }: Props = $props();
  const rowsPerPage = handler.getRowsPerPage();
  const options = [5, 10, 20, 50, 100];
</script>

<aside class="flex place-items-center">
  Show
  <select class="select ml-2" bind:value={$rowsPerPage}>
    {#each options as option}
      <option value={option}>
        {option}
      </option>
    {/each}
  </select>
</aside>
