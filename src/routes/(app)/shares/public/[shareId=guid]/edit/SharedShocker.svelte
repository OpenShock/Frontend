<script lang="ts">
  import { shareLinksPauseShocker, shareLinksRemoveShocker } from '$lib/api';
  import type { PublicShareShocker, ShockerPermissions } from '$lib/api';
  import { Pause, Play, Trash2, Zap, Vibrate, Volume2, Radio } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import { Switch } from '$lib/components/ui/switch';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { formatDurationSeconds } from '$lib/utils';
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

  const updatePermission = (feature: keyof ShockerPermissions, enabled: boolean) => {
    shocker.permissions = { ...shocker.permissions, [feature]: enabled };
  };

  let durationSeconds = $state(shocker.limits.duration ? shocker.limits.duration / 1000 : 30);
  let intensity = $state(shocker.limits.intensity ?? 100);

  $effect(() => {
    const durationMs = durationSeconds * 1000;
    if (shocker.limits.duration !== durationMs) {
      shocker.limits = { ...shocker.limits, duration: durationMs };
    }
  });

  $effect(() => {
    if (shocker.limits.intensity !== intensity) {
      shocker.limits = { ...shocker.limits, intensity };
    }
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

  const features = [
    { key: 'shock', label: 'Shock', icon: Zap },
    { key: 'vibrate', label: 'Vibrate', icon: Vibrate },
    { key: 'sound', label: 'Sound', icon: Volume2 },
    { key: 'live', label: 'Live Control', icon: Radio },
  ] satisfies { key: keyof ShockerPermissions; label: string; icon: typeof Zap }[];
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
  <div class="flex flex-col gap-4 p-3">
    <!-- Feature toggles -->
    <div class="grid grid-cols-2 gap-2">
      {#each features as { key, label, icon: Icon } (key)}
        {@const enabled = shocker.permissions[key] ?? false}
        <div
          class="border-border/60 flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 transition-colors"
          class:opacity-60={!enabled}
        >
          <span class="flex min-w-0 items-center gap-2">
            <Icon size={14} class="shrink-0" />
            <span class="truncate text-xs font-medium">{label}</span>
          </span>
          <Switch checked={enabled} onCheckedChange={(checked) => updatePermission(key, checked)} />
        </div>
      {/each}
    </div>

    <!-- Sliders -->
    <div class="flex flex-col gap-3">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <Label class="text-xs">Max Duration</Label>
          <span class="text-muted-foreground font-mono text-xs"
            >{formatDurationSeconds(durationSeconds)}</span
          >
        </div>
        <Slider type="single" bind:value={durationSeconds} min={1} max={30} step={0.1} />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <Label class="text-xs">Max Intensity</Label>
          <span class="text-muted-foreground font-mono text-xs">{intensity}%</span>
        </div>
        <Slider type="single" bind:value={intensity} min={1} max={100} step={1} />
      </div>
    </div>
  </div>
</div>
