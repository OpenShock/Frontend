<script lang="ts">
  import type { LoginSessionResponse } from '$lib/api';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { formatElapsed, durationBetween } from '$lib/utils/temporal';
  import { getReadableUserAgentName } from '$lib/utils/userAgent';
  import { UAParser } from 'ua-parser-js';
  import Monitor from '@lucide/svelte/icons/monitor';
  import Smartphone from '@lucide/svelte/icons/smartphone';
  import Tablet from '@lucide/svelte/icons/tablet';
  import Cpu from '@lucide/svelte/icons/cpu';
  import Tv from '@lucide/svelte/icons/tv';
  import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
  import X from '@lucide/svelte/icons/x';
  import SessionRevokeDialog from './dialog-session-revoke.svelte';

  interface Props {
    session: LoginSessionResponse;
    isCurrent: boolean;
    onRevoked: (sessionId: string) => void;
  }

  let { session, isCurrent, onRevoked }: Props = $props();

  let revokeDialogOpen = $state(false);

  const deviceIconMap: Record<string, typeof Monitor> = {
    mobile: Smartphone,
    tablet: Tablet,
    embedded: Cpu,
    smarttv: Tv,
    console: Gamepad2,
  };

  const DeviceIcon = $derived.by(() => {
    const ua = new UAParser(session.userAgent);
    const type = ua.getDevice().type ?? 'desktop';
    return deviceIconMap[type] ?? Monitor;
  });

  const readableName = $derived(
    getReadableUserAgentName(session.userAgent) ?? session.userAgent ?? 'Unknown device'
  );

  const now = $derived(Temporal.Now.instant());

  // Past events: durationBetween(now, pastInstant) → negative → "X ago"
  const lastSeenText = $derived(
    session.lastUsed ? formatElapsed(durationBetween(now, session.lastUsed)) : 'Never'
  );
  const createdText = $derived(formatElapsed(durationBetween(now, session.created)));
  // Future event: durationBetween(now, futureInstant) → positive → "in X"
  const expiresText = $derived(formatElapsed(durationBetween(now, session.expires)));
</script>

<SessionRevokeDialog bind:open={revokeDialogOpen} {session} {onRevoked} />

<div
  class="flex flex-col gap-3 rounded-lg border p-4 transition-colors {isCurrent
    ? 'border-green-600/50 bg-green-950/20'
    : 'hover:bg-muted/30'}"
>
  <!-- Header row: icon + name + badge + revoke -->
  <div class="flex items-start gap-3">
    <div
      class="mt-0.5 shrink-0 rounded-md p-1.5 {isCurrent
        ? 'bg-green-900/40 text-green-400'
        : 'bg-muted text-muted-foreground'}"
    >
      <DeviceIcon class="size-5" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 overflow-hidden">
        <span class="min-w-0 truncate font-semibold leading-tight">{readableName}</span>
        {#if isCurrent}
          <Badge variant="outline" class="shrink-0 border-green-600 text-xs text-green-400">
            This device
          </Badge>
        {/if}
      </div>
      <div class="text-muted-foreground mt-0.5 font-mono text-xs">{session.ip}</div>
    </div>

    {#if !isCurrent}
      <Button
        variant="ghost"
        size="icon"
        class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
        onclick={() => (revokeDialogOpen = true)}
        title="Revoke session"
      >
        <X class="size-4" />
      </Button>
    {/if}
  </div>

  <!-- Timestamps -->
  <div class="text-muted-foreground flex flex-col gap-0.5 pl-10 text-sm">
    {#if !isCurrent}
      <span>Last seen {lastSeenText}</span>
    {/if}
    <span>
      Created {createdText}
      {#if !isCurrent}
        · Expires {expiresText}{/if}
    </span>
  </div>
</div>
