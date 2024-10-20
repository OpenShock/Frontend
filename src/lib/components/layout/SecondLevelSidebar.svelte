<script lang="ts">
  import type { RouteCategory } from './Route';
  import { page } from '$app/stores';

  interface Props {
    baseRoute: string;
    routes: RouteCategory[];
  }

  let { baseRoute, routes }: Props = $props();
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
                href={route.href}
                target={route.target}
                class={'transition ease-in-out ' + ($page.url.pathname === route.href ? 'bg-primary-active-token' : '')}
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
