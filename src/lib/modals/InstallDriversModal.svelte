<script lang="ts">
  import Bowser from 'bowser';
  import { browser } from '$app/environment';
  import { Step, Stepper, getModalStore } from '@skeletonlabs/skeleton';
  import { PUBLIC_DISCORD_INVITE_URL } from '$env/static/public';

  const modalStore = getModalStore();
</script>

<div class="card p-4 m-auto">
  <header class="card-header">
    <h3 class="h3 font-bold">Install device drivers</h3>
  </header>
  <section class="flex flex-col p-4 gap-4">
    <div class="flex flex-col gap-1">
      <h4 class="h4">1. Download drivers</h4>
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
      <h4 class="h4">2. Extract the zip file</h4>
      <p>Extract the contents of the zip file to a folder on your computer.</p>
    </div>
    <div class="flex flex-col gap-1">
      <h4 class="h4">3. Run the installer</h4>
      <p>
        Go to the folder where you extracted the zip file and run
        <code class="code">CP210xVCPInstaller_x64.exe</code><br />
        Follow the instructions to install the drivers.
      </p>
    </div>
    <h3 class="h3 font-bold mt-6">If the device still doesn't appear in the list:</h3>
    <div class="flex flex-col gap-1">
      <h4 class="h4">1. Open Device Manager</h4>
      <p>
        Press <kbd class="kbd">Win</kbd> + <kbd class="kbd">X</kbd> and select
        <code class="code">Device Manager</code>.
      </p>
    </div>
    <div class="flex flex-col gap-1">
      <h4 class="h4">2. Find your device</h4>
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
      <h4 class="h4">3. Update drivers</h4>
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
    <h3 class="h3 font-bold mt-6">Still having problems?</h3>
    <div class="flex flex-col gap-1">
      <p>
        If you still have problems, join our discord server and ask for help in the <code
          class="code">#support</code
        >
        channel.
      </p>
      <a
        href={PUBLIC_DISCORD_INVITE_URL}
        target="_parent"
        rel="noopener noreferrer"
        class="btn variant-filled-primary gap-2"
      >
        <i class="fa-brands fa-discord" />
        Join our Discord server
      </a>
    </div>
  </section>
</div>
