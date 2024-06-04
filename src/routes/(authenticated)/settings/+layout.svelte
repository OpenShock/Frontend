<script lang="ts">
  import { page } from '$app/stores';

  const paths = [
    {
      name: 'Account',
      path: '/settings/account',
    },
    {
      name: 'API Tokens',
      path: '/settings/api-tokens',
    },
  ];
</script>

<div class="flex items-stretch">
  <section
    class="p-4 space-y-4 overflow-x-y-auto text-nowrap bg-surface-100-800-token border-l border-l-slate-700"
  >
    <p class="font-bold text-2xl">General</p>
    <nav class="list-nav">
      <ul>
        {#each paths as { name, path }}
          <li>
            <a href={path} class={$page.url.pathname === path ? 'bg-primary-active-token' : ''}>
              {name}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
    <p class="font-bold text-2xl text-red-500">Danger Zone</p>
    <nav class="list-nav">
      <ul>
        <li>
          <a
            href="/settings/delete-account"
            class={$page.url.pathname === '/settings/delete-account'
              ? 'bg-primary-active-token'
              : ''}
          >
            Delete Account
          </a>
        </li>
      </ul>
    </nav>
  </section>
  <slot />
</div>
