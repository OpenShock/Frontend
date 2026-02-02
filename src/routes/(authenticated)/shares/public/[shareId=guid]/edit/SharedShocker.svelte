<script lang="ts">
  import { Pause, Play, Trash2 } from '@lucide/svelte';
  import { publicShockerSharesApi } from '$lib/api';
  import type { PublicShareShocker, ShockerPermissions } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import { Switch } from '$lib/components/ui/switch';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    shareId: string;
    shocker: PublicShareShocker;
    onRemoved?: (shockerId: string) => void;
  }

  let { shareId, shocker = $bindable(), onRemoved }: Props = $props();

  // Bit 4 (0b100) represents PublicShare pause reason
  const PUBLIC_SHARE_PAUSE_BIT = 4;
  let isPausedByPublicShare = $derived((shocker.paused & PUBLIC_SHARE_PAUSE_BIT) !== 0);

  let isTogglingPause = $state(false);
  let isRemoving = $state(false);

  const togglePause = async () => {
    if (isTogglingPause) return;
    isTogglingPause = true;

    try {
      const newPauseState = !isPausedByPublicShare;
      const response = await publicShockerSharesApi.shareLinksPauseShocker(shareId, shocker.id, {
        pause: newPauseState,
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

  // Local state for slider values (handles null defaults)
  // API uses milliseconds, UI uses seconds for display
  let durationSeconds = $state(shocker.limits.duration ? shocker.limits.duration / 1000 : 30);
  let intensity = $state(shocker.limits.intensity ?? 100);

  // Sync slider changes back to shocker (convert seconds to milliseconds for API)
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
      await publicShockerSharesApi.shareLinksRemoveShocker(shareId, shocker.id);
      toast.success('Shocker removed from share');
      onRemoved?.(shocker.id);
    } catch (error) {
      handleApiError(error);
    } finally {
      isRemoving = false;
    }
  };
</script>

<Card>
  <CardHeader>
    <CardTitle class="flex items-center justify-between">
      <span class="text-lg font-medium">{shocker.name}</span>
      <Button
        variant="outline"
        size="sm"
        onclick={togglePause}
        disabled={isTogglingPause}
        title={isPausedByPublicShare ? 'Resume shocker' : 'Pause shocker'}
      >
        {#if isPausedByPublicShare}
          <Play size={16} />
        {:else}
          <Pause size={16} />
        {/if}
      </Button>
    </CardTitle>
  </CardHeader>

  <CardContent class="space-y-4">
    <!-- Feature Toggles -->
    <div class="space-y-2">
      {#each ['shock', 'vibrate', 'sound', 'live'] satisfies (keyof ShockerPermissions)[] as feature (feature)}
        <div class="flex items-center justify-between">
          <Label class="capitalize">{feature === 'live' ? 'Live Control' : feature}</Label>
          <Switch
            checked={shocker.permissions[feature] ?? false}
            onCheckedChange={(checked) => updatePermission(feature, checked)}
          />
        </div>
      {/each}
    </div>

    <!-- Duration Slider -->
    <div class="space-y-1">
      <Label>Duration: {durationSeconds}s</Label>
      <Slider type="single" bind:value={durationSeconds} min={1} max={30} step={0.1} />
    </div>

    <!-- Intensity Slider -->
    <div class="space-y-1">
      <Label>Intensity: {intensity}%</Label>
      <Slider type="single" bind:value={intensity} min={1} max={100} step={1} />
    </div>
  </CardContent>

  <CardFooter>
    <Button variant="destructive" size="sm" onclick={removeShocker} disabled={isRemoving}>
      <Trash2 size={16} class="mr-1" />
      Remove
    </Button>
  </CardFooter>
</Card>
