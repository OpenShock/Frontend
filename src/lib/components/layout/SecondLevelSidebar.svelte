<script lang="ts">
  import type { RouteCategory } from './Route';
  import { page } from '$app/stores';

  export let baseRoute: string;
  export let routes: RouteCategory[];
</script>

{#if $page.url.pathname.startsWith(baseRoute)}
  <section
    class="p-4 space-y-4 overflow-x-y-auto text-nowrap bg-surface-100-800-token border-l border-surface-400-500-token min-w-[270px]"
  >
    {#each routes as category}
      <p class="font-bold text-2xl {category.headerClass}">{category.name}</p>
      <nav class="list-nav">
        <ul>
          {#each category.routes as route }
            <li>
              <a
                href={route.path}
                target={route.external ? '_blank' : ''}
                class={$page.url.pathname === route.path ? 'bg-primary-active-token' : ''}
              >
                {route.name}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/each}
  </section>
{/if}
