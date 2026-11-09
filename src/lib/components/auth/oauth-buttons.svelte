<script lang="ts" module>
  import { XLogo, DiscordLogo, GoogleLogo } from '@openshock/svelte-core/components/svg';

  const providerDetails: Record<string, { icon: typeof XLogo; label: string }> = {
    discord: { icon: DiscordLogo, label: 'Discord' },
    twitter: { icon: XLogo, label: 'X (Twitter)' },
    google: { icon: GoogleLogo, label: 'Google' },
  };
</script>

<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Field } from '@openshock/svelte-core/components/ui/field';
  import { GetOAuthAuthorizeUrl } from '#lib/api/next/oauth.js';
  import { LogIn } from '@lucide/svelte';

  let { mode = 'login', providers }: { mode?: 'login' | 'signup'; providers: string[] } = $props();
</script>

<Field>
  {#each providers as provider (provider)}
    {@const detail = providerDetails[provider]}
    <form action={GetOAuthAuthorizeUrl(provider, 'LoginOrCreate')} method="POST">
      <Button variant="outline" type="submit" class="w-full">
        {#if detail}
          <detail.icon></detail.icon>
        {:else}
          <LogIn />
        {/if}
        {mode === 'signup'
          ? m.oauth_signup_with({ provider: detail?.label ?? provider })
          : m.oauth_login_with({ provider: detail?.label ?? provider })}
      </Button>
    </form>
  {/each}
</Field>
