<script lang="ts">
  import Bowser from 'bowser';
  import { browser } from '$app/environment';
  import { Step, Stepper, getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
</script>

<div class="card p-4 m-auto">
  <header class="card-header">
    <h3 class="h3 font-bold">Install device drivers</h3>
  </header>
  <section class="flex flex-col p-4 gap-4">
    <div class="flex flex-col gap-1">
      <h4 class="h4">1. Download drivers</h4>
      <p>Download and extract the drivers for your device from the following link:</p>
      <a
        href="https://download.openshock.org/drivers/CP210x_Universal_Windows_Driver.zip"
        target="_parent"
        rel="noopener noreferrer"
        class="btn variant-filled-primary gap-2"
      >
        <i class="fa fa-download" />
        CP210x Universal Windows Driver
      </a>
    </div>
    <div class="flex flex-col gap-1">
      <h4 class="h4">2. Open Device Manager</h4>
      <p>
        Open Device Manager by pressing <kbd class="kbd">Win + R</kbd> and typing
        <code class="code">devmgmt.msc</code>.
      </p>
    </div>
    <div class="flex flex-col gap-1">
      <h4 class="h4">3. Find your device</h4>
      <p>
        Go to <code class="code">Ports (COM & LPT)</code> and look a device similar to one of the following:
      </p>
      <ul class="list">
        <li><code class="code">Silicon Labs CP210x USB to UART Bridge</code></li>
        <li><code class="code">Silicon Labs CP210x USB to UART Bridge (COM...)</code></li>
      </ul>
      <p>
        If you don't see it in the list, make sure that your device is connected to your computer.
      </p>
    </div>
    <div class="flex flex-col gap-1">
      <h4 class="h4">4. Update drivers</h4>
      <p>
        Right click on the device and select <code class="code">Update Driver</code>.
      </p>
      <p>
        Select <code class="code">Browse my computer for drivers</code> and browse to the folder where
        you extracted the zip file.
      </p>
      <p>Make sure that <code class="code">Include subfolders</code> option is checked.</p>
      <p>
        If successful, you should see <code class="code"
          >Silicon Labs CP210x USB to UART Bridge</code
        > in the list.
      </p>
    </div>
  </section>
</div>
