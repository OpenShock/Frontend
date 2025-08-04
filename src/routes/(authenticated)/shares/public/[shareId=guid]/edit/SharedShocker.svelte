<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import type { PublicShareShocker, ShockerPermissions } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import { Switch } from '$lib/components/ui/switch';

  interface Props {
    shocker: PublicShareShocker;
  }

  let { shocker }: Props = $props();

  // UI callbacks (stub implementations)
  const togglePlay = async (shockerId: string) => {
    // TODO: Call API to toggle play state
  };

  const toggleFeature = async (shockerId: string, feature: string, enabled: boolean) => {
    // TODO: Call API to toggle feature (shock, vibrate, sound, livecontrol, estop)
  };

  const updateDuration = async (shockerId: string, duration: number) => {
    // TODO: Call API to update duration limit
  };

  const updateIntensity = async (shockerId: string, intensity: number) => {
    // TODO: Call API to update intensity limit
  };

  const removeShocker = async (shockerId: string) => {
    // TODO: Call API to remove shocker from share
  };
</script>

<Card>
  <CardHeader>
    <CardTitle class="flex items-center justify-between">
      <span class="text-lg font-medium">{shocker.name}</span>
      <Button variant="outline" size="sm" onclick={() => togglePlay(shocker.id)}>
        {#if shocker.paused}
          <Pause size={16} />
        {:else}
          <Play size={16} />
        {/if}
      </Button>
    </CardTitle>
  </CardHeader>

  <CardContent class="space-y-4">
    <!-- Feature Toggles -->
    <div class="space-y-2">
      {#each ['shock', 'vibrate', 'sound', 'live'] satisfies (keyof ShockerPermissions)[] as feature}
        <div class="flex items-center justify-between">
          <Label class="capitalize">{feature}</Label>
          <Switch
            checked={shocker.permissions[feature]}
            onCheckedChange={(e) => toggleFeature(shocker.id, feature, e)}
          />
        </div>
      {/each}
    </div>

    <!-- Duration Slider -->
    <div class="space-y-1">
      <Label>Duration: {shocker.limits.duration}s</Label>
      <Slider type="single" value={shocker.limits.duration ?? 0} min={1} max={120} step={1} />
    </div>

    <!-- Intensity Slider -->
    <div class="space-y-1">
      <Label>Intensity: {shocker.limits.intensity}%</Label>
      <Slider type="single" value={shocker.limits.intensity ?? 0} min={0} max={100} step={5} />
    </div>
  </CardContent>

  <CardFooter>
    <Button variant="destructive" size="sm" onclick={() => removeShocker(shocker.id)}>
      Remove
    </Button>
  </CardFooter>
</Card>
