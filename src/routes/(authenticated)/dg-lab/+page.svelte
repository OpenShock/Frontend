<script lang="ts">
  import ControlListener, { type ShockerState } from '$lib/components/ControlModules/ControlListener.svelte';
import { Slider } from '$lib/components/ui/slider';
  import { DeviceVersion } from '$lib/dglab';
  import DGLab3 from '$lib/dglab/v3/dglab3';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import {
    AddListener,
    type ListenerSignature,
    RemoveListener,
  } from '$lib/stores/ShockEventListenerStore';
  import { onMount } from 'svelte';

  let aIntensity = $state(100);
  let bIntensity = $state(100);
  let aFrequency = $state(10);
  let bFrequency = $state(10);
  let aIntensityLimit = $state(10);
  let bIntensityLimit = $state(10);

  let localAIntensityMax = $state(20);
  let localBIntensityMax = $state(20);

  let dglab3: DGLab3;

  const id = $props.id();

  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  onMount(() => {
    dglab3 = new DGLab3();
  });

  $effect(() => {

    if(shockerStateA.active === ControlType.Shock) {
      const finalAIntensity = lerp(0, localAIntensityMax, shockerStateA.intensity / 100)

      aIntensityLimit = finalAIntensity;
    } else {
      aIntensityLimit = 0;
    }

    if(shockerStateB.active === ControlType.Shock) {
      const finalBIntensity = lerp(0, localBIntensityMax, shockerStateB.intensity / 100)

      bIntensityLimit = finalBIntensity;
    } else {
      bIntensityLimit = 0;
    }
  });

  $effect(() => {
    dglab3.aIntensity = aIntensity;
    dglab3.bIntensity = bIntensity;
    dglab3.aFrequency = aFrequency;
    dglab3.bFrequency = bFrequency;
    dglab3.aIntensityLimit = aIntensityLimit;
    dglab3.bIntensityLimit = bIntensityLimit;
  });

  let shockerStateA = $state<ShockerState>({ active: null, intensity: 0, duration: 0 });
  let shockerStateB = $state<ShockerState>({ active: null, intensity: 0, duration: 0 });

</script>

<ControlListener shockerId="1c5fa273-8609-44ab-9084-90b533cf5010" bind:state={shockerStateA} />
<ControlListener shockerId="500909ee-399e-45b8-a6cb-3933131bf80f" bind:state={shockerStateB} />

<h1 class="text-8xl font-bold text-center">Dungeon Lab Controls</h1>

<p>A: {JSON.stringify(shockerStateA)}</p>
<p>B: {JSON.stringify(shockerStateB)}</p>

<button class="btn btn-primary" onclick={() => dglab3.scanBT(DeviceVersion.V3_0)}
  >Scan for Devices</button
>
<button class="btn btn-secondary" onclick={() => dglab3.startSending()}>Send Start</button>
<button class="btn btn-secondary" onclick={() => dglab3.stopSending()}>Send Stop</button>
<button class="btn btn-secondary" onclick={() => dglab3.setBT()}>Set BT</button>

<div class="max-w-5xl mx-auto">
  <br />
  <label for="a-intensity-slider">
    A Intensity: {aIntensity}
  </label>
  <Slider
    id="a-intensity-slider"
    type="single"
    bind:value={aIntensity}
    min={0}
    max={100}
    step={1}
  />

  <br />
  <label for="b-intensity-slider">
    B Intensity: {bIntensity}
  </label>
  <Slider
    id="b-intensity-slider"
    type="single"
    bind:value={bIntensity}
    min={0}
    max={100}
    step={1}
  />

  <br />
  <label for="a-frequency-slider">
    A Frequency: {aFrequency}
  </label>
  <Slider
    id="a-frequency-slider"
    type="single"
    bind:value={aFrequency}
    min={10}
    max={100}
    step={1}
  />

  <br />
  <label for="b-frequency-slider">
    B Frequency: {bFrequency}
  </label>
  <Slider
    id="b-frequency-slider"
    type="single"
    bind:value={bFrequency}
    min={10}
    max={100}
    step={1}
  />

  <br />

  <label for="a-intensity-limit-slider">
    A Intensity Limit: {aIntensityLimit}
  </label>
  <Slider
    id="a-intensity-limit-slider"
    type="single"
    bind:value={aIntensityLimit}
    min={0}
    max={200}
    step={1}
  />

  <br />

  <label for="b-intensity-limit-slider">
    B Intensity Limit: {bIntensityLimit}
  </label>
  <Slider
    id="b-intensity-limit-slider"
    type="single"
    bind:value={bIntensityLimit}
    min={0}
    max={200}
    step={1}
  />

  <br />
  <label for="local-a-intensity-max-slider">
    Local A Intensity Max: {localAIntensityMax}
  </label>
  <Slider
    id="local-a-intensity-max-slider"
    type="single"
    bind:value={localAIntensityMax}
    min={0}
    max={200}
    step={1}
  />

  <br />
  <label for="local-b-intensity-max-slider">
    Local B Intensity Max: {localBIntensityMax}
  </label>
  <Slider
    id="local-b-intensity-max-slider"
    type="single"
    bind:value={localBIntensityMax}
    min={0}
    max={200}
    step={1}
  />

</div>


