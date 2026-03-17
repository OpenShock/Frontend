<script lang="ts">
  import * as Breadcrumb from '$lib/components/ui/breadcrumb';
  import { breadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
</script>

{#if breadcrumbs.state.length > 0}
  <Breadcrumb.Root>
    <Breadcrumb.List>
      {#each breadcrumbs.state as crumb, index (crumb.href)}
        <Breadcrumb.Item>
          {#if index < breadcrumbs.state.length - 1}
            <Breadcrumb.Link href={crumb.href} class="text-gray-600 dark:text-gray-300">
              {crumb.text}
            </Breadcrumb.Link>
            <Breadcrumb.Separator class="text-gray-600 dark:text-gray-300" />
          {:else}
            <Breadcrumb.Page class="text-gray-900 dark:text-gray-100">
              {crumb.text}
            </Breadcrumb.Page>
          {/if}
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>
{/if}
