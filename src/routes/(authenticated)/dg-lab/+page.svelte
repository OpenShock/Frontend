<script lang="ts">
  import { DeviceVersion } from '$lib/dglab';
  import DGLab3 from '$lib/dglab/v3/dglab3';
  import { onMount } from 'svelte';

  let dglab3: DGLab3;

  onMount(() => {
      dglab3 = new DGLab3();

    });
</script>

<h1 class="text-8xl font-bold text-center">
  Dungeon Lab Controls
</h1>

<button class="btn btn-primary" onclick={() => dglab3.scanBT(DeviceVersion.V3_0)}>Scan for Devices</button>
<button class="btn btn-secondary" onclick={() => dglab3.startSending()}>Send Start</button>
<button class="btn btn-secondary" onclick={() => dglab3.stopSending()}>Send Stop</button>
<button class="btn btn-secondary" onclick={() => dglab3.setBT()}>Set BT</button>