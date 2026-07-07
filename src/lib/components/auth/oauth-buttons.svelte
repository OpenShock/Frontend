<script lang="ts" module>
  import { XLogo } from '@openshock/svelte-core/components/svg';
  import { DiscordLogo } from '@openshock/svelte-core/components/svg';
  import { GoogleLogo } from '@openshock/svelte-core/components/svg';

  const providerDetails: Record<string, { icon: typeof XLogo; label: string }> = {
    discord: { icon: DiscordLogo, label: 'Discord' },
    twitter: { icon: XLogo, label: 'X (Twitter)' },
    google: { icon: GoogleLogo, label: 'Google' },
  };
</script>

<script lang="ts">
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Field } from '@openshock/svelte-core/components/ui/field';
  import { GetOAuthAuthorizeUrl } from '$lib/api/next/oauth';
  import { LogIn } from '@lucide/svelte';

  let { verb = 'Login', providers }: { verb?: string; providers: string[] } = $props();
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
        {verb} with {detail?.label ?? provider}
      </Button>
    </form>
  {/each}
</Field>
