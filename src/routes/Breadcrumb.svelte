<script lang="ts">
  import * as Breadcrumb from '$lib/components/ui/breadcrumb';
  import { breadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { prefixBase } from '$lib/utils/url';
</script>

{#if breadcrumbs.state.length > 0}
  <Breadcrumb.Root class="shrink-0">
    <Breadcrumb.List>
      {#each breadcrumbs.state as crumb, i (i)}
        {#if i > 0}
          <Breadcrumb.Separator />
        {/if}
        <Breadcrumb.Item>
          {#if crumb.href && i < breadcrumbs.state.length - 1}
            <Breadcrumb.Link href={prefixBase(crumb.href)}>{crumb.label}</Breadcrumb.Link>
          {:else}
            <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
          {/if}
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>
{/if}
