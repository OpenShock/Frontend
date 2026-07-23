<script lang="ts">
  import { shareLinksPauseShocker, shareLinksRemoveShocker } from '$lib/api';
  import type { PublicShareShocker } from '$lib/api';
  import { Pause, Play, Trash2 } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import RestrictionsSelector from '$lib/components/shares/restrictions-selector.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    shareId: string;
    shocker: PublicShareShocker;
    onRemoved?: (shockerId: string) => void;
  }

  let { shareId, shocker = $bindable(), onRemoved }: Props = $props();

  const PUBLIC_SHARE_PAUSE_BIT = 4;
  let isPausedByPublicShare = $derived((shocker.paused & PUBLIC_SHARE_PAUSE_BIT) !== 0);

  let isTogglingPause = $state(false);
  let isRemoving = $state(false);

  const togglePause = async () => {
    if (isTogglingPause) return;
    isTogglingPause = true;

    try {
      const newPauseState = !isPausedByPublicShare;
      const response = await shareLinksPauseShocker({
        path: { publicShareId: shareId, shockerId: shocker.id },
        body: { pause: newPauseState },
      });

      if (response.data !== undefined) {
        shocker.paused = response.data;
      }
      toast.success(newPauseState ? 'Shocker paused' : 'Shocker resumed');
    } catch (error) {
      handleApiError(error);
    } finally {
      isTogglingPause = false;
    }
  };

  // RestrictionsSelector needs non-nullable values; normalise the API shape and
  // write edits back onto the shocker so the parent's save picks them up.
  let permissions = $state({
    shock: shocker.permissions.shock ?? false,
    vibrate: shocker.permissions.vibrate ?? false,
    sound: shocker.permissions.sound ?? false,
    live: shocker.permissions.live ?? false,
  });
  let limits = $state({
    intensity: shocker.limits.intensity ?? 100,
    duration: shocker.limits.duration ?? 30_000,
  });

  $effect(() => {
    shocker.permissions = permissions;
    shocker.limits = limits;
  });

  const removeShocker = async () => {
    if (isRemoving) return;
    isRemoving = true;

    try {
      await shareLinksRemoveShocker({ path: { publicShareId: shareId, shockerId: shocker.id } });
      toast.success('Shocker removed from share');
      onRemoved?.(shocker.id);
    } catch (error) {
      handleApiError(error);
    } finally {
      isRemoving = false;
    }
  };
</script>

<div
  class="border-surface-400-500-token bg-card flex w-80 flex-col overflow-hidden rounded-md border"
>
  <!-- Header — mirrors ShockerCard -->
  <div class="border-border/60 flex items-center gap-2 border-b px-3 py-2">
    <div class="flex min-w-0 flex-1 flex-col">
      <h2 class="truncate text-sm leading-tight font-semibold" title={shocker.name}>
        {shocker.name}
      </h2>
      {#if isPausedByPublicShare}
        <span class="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <span class="size-1.5 shrink-0 rounded-full bg-amber-400"></span>
          Paused for this share
        </span>
      {/if}
    </div>
    <Button
      variant="ghost"
      size="icon"
      class="h-7 w-7 shrink-0"
      onclick={togglePause}
      disabled={isTogglingPause}
      title={isPausedByPublicShare ? 'Resume shocker' : 'Pause shocker'}
    >
      {#if isPausedByPublicShare}
        <Play size={14} />
      {:else}
        <Pause size={14} />
      {/if}
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="text-destructive hover:text-destructive h-7 w-7 shrink-0"
      onclick={removeShocker}
      disabled={isRemoving}
      title="Remove from share"
    >
      <Trash2 size={14} />
    </Button>
  </div>

  <!-- Body -->
  <div class="p-3">
    <RestrictionsSelector bind:permissions bind:limits />
  </div>
</div>
