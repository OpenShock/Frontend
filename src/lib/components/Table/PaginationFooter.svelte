<script lang="ts">
  import {
    Content,
    Ellipsis,
    Item,
    Link,
    NextButton,
    PrevButton,
    Root,
  } from '$lib/components/ui/pagination';

  interface Props {
    count: number;
    perPage: number;
    page: number;
    disabled?: boolean;
  }

  let { count, perPage, page = $bindable(), disabled }: Props = $props();
</script>

<Root {count} {perPage} bind:page>
  {#snippet children({ pages, currentPage })}
    <Content>
      <Item>
        <PrevButton {disabled} />
      </Item>
      {#each pages as page (page.key)}
        {#if page.type === 'ellipsis'}
          <Item>
            <Ellipsis />
          </Item>
        {:else}
          <Item>
            <Link {page} isActive={currentPage === page.value} {disabled}>
              {page.value}
            </Link>
          </Item>
        {/if}
      {/each}
      <Item>
        <NextButton {disabled} />
      </Item>
    </Content>
  {/snippet}
</Root>
