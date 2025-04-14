<script lang="ts">
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import MapControlModule from '$lib/components/ControlModules/MapControlModule.svelte';
  import { ModuleType } from '$lib/components/ControlModules/ModuleType';
  import RichControlModule from '$lib/components/ControlModules/RichControlModule.svelte';
  import SimpleControlHeader from '$lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';
  import * as Popover from '$lib/components/ui/popover';
  import { ControlDurationDefault, ControlIntensityDefault } from '$lib/constants/ControlConstants';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import { OwnHubsStore } from '$lib/stores/HubsStore';

  import { Layers, Settings } from '@lucide/svelte';

  let shockers = $derived(Array.from($OwnHubsStore).flatMap(([, hub]) => hub.shockers));

  let moduleType = $state<ModuleType>(ModuleType.ClassicControlModule);

  let shockIntensity = $state(ControlIntensityDefault);
  let vibrationIntensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  
  function handleSimpleControl(shockerId: string, controlType: ControlType) {
    let intensity: number;
    switch (controlType) {
      case ControlType.Stop:
        intensity = 0;
        break;
      case ControlType.Shock:
        intensity = shockIntensity;
        break;
      case ControlType.Vibrate:
        intensity = vibrationIntensity;
        break;
      case ControlType.Sound:
        intensity = 0;
        break;
      default:
        return;
    }

    if (!$SignalR_Connection) return;
    serializeControlMessages($SignalR_Connection, [{ id: shockerId, type: controlType, intensity, duration }]).catch((error) => {
      console.error('Error sending control messages:', error);
    });
  }
</script>

<!-- Rounded bordered container -->
<div class="container flex flex-col gap-4 py-4">
  {#if $OwnHubsStore == null}
    <p>Loading...</p>
  {:else}
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Shockers</h1>
      <div>
        <!-- Mode button -->
        <Popover.Root>
          <Popover.Trigger><Layers /></Popover.Trigger>
          <Popover.Content>
            <div class="flex gap-2">
              <button
                class="btn variant-filled-secondary p-2"
                onclick={() => (moduleType = ModuleType.ClassicControlModule)}
              >
                Classic
              </button>
              <button
                class="btn variant-filled-secondary p-2"
                onclick={() => (moduleType = ModuleType.RichControlModule)}
              >
                Rich
              </button>
              <button
                class="btn variant-filled-secondary p-1"
                onclick={() => (moduleType = ModuleType.SimpleControlModule)}
              >
                Simple
              </button>
              <button
                class="btn variant-filled-secondary p-1"
                onclick={() => (moduleType = ModuleType.MapControlModule)}
              >
                Map
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
        <!-- Options button -->
        <button class="btn p-1" aria-label="Options">
          <Settings />
        </button>
      </div>
    </div>
    <hr class="border-2" />
    {#if moduleType === ModuleType.SimpleControlModule}
      <SimpleControlHeader bind:shockIntensity bind:vibrationIntensity bind:duration />
    {/if}
    {#if moduleType === ModuleType.MapControlModule}
      <MapControlModule {shockers} />
    {:else}
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each shockers ?? [] as shocker (shocker.id)}
          {#if moduleType === ModuleType.ClassicControlModule}
            <ClassicControlModule {shocker} />
          {:else if moduleType === ModuleType.RichControlModule}
            <RichControlModule {shocker} />
          {:else if moduleType === ModuleType.SimpleControlModule}
            <SimpleControlModule {shocker} controlHandler={handleSimpleControl} />
          {:else}
            <p>Unknown module type</p>
          {/if}
        {/each}
      </div>
    {/if}
  {/if}
</div>
