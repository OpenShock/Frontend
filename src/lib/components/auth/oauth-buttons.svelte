<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Field } from '$lib/components/ui/field/index.js';
  import { GetOAuthAuthorizeUrl } from '$lib/api/next/oauth';
  import XLogo from '../svg/XLogo.svelte';
  import DiscordLogo from '../svg/DiscordLogo.svelte';
  import GoogleLogo from '../svg/GoogleLogo.svelte';
  import { Skeleton } from '../ui/skeleton';
  import { LogIn } from '@lucide/svelte';

  let providers = $state<string[]>(JSON.parse(sessionStorage.getItem('oAuthProviders') ?? '[]'));

  const providerDetails: Record<string, { icon: typeof XLogo; label: string }> = {
    discord: { icon: DiscordLogo, label: 'Discord' },
    twitter: { icon: XLogo, label: 'X (Twitter)' },
    google: { icon: GoogleLogo, label: 'Google' },
  };
</script>

<Field>
  {#if sessionStorage.getItem('oAuthProviders') === null}
    <Skeleton class="h-9 w-full"></Skeleton>
    <Skeleton class="h-9 w-full"></Skeleton>
  {:else}
    {#each providers as provider (provider)}
      {@const detail = providerDetails[provider]}
      <form action={GetOAuthAuthorizeUrl(provider, 'LoginOrCreate')} method="POST">
        <Button variant="outline" type="submit" class="w-full">
          {#if detail}
            <detail.icon></detail.icon>
          {:else}
            <LogIn />
          {/if}
          Login with {detail?.label ?? provider}
        </Button>
      </form>
    {/each}
  {/if}
</Field>
