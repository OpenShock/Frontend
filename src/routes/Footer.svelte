<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve -- only contains external URLs */

  import { HubConnectionState } from '@microsoft/signalr';
  import { PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import { getConnectionState } from '$lib/signalr/index.svelte';
  import { Wifi, WifiOff } from '@lucide/svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { Button } from '$lib/components/ui/button';
  import { backendMetadata } from '$lib/state/BackendMetadata.svelte';
</script>

<footer
  class="text-muted-foreground text-sm-foreground bottom-0 flex flex-none items-center justify-between px-2"
>
  <div>
    Made with
    <span style="color: #e25555;">&#9829;</span>
    by the
    <a target="_blank" rel="noopener noreferrer" href={PUBLIC_GITHUB_PROJECT_URL}>
      OpenShock Team</a
    >
  </div>
  <div class="flex items-center gap-2">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="icon" class="h-4 w-4">
            {#if getConnectionState() === HubConnectionState.Connected}
              <Wifi class="h-4 w-4 text-green-800" />
            {:else}
              <WifiOff class="h-4 w-4 text-red-800" />
            {/if}
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="p-3" align="start">
        <table class="w-full [&_td]:px-4 [&_td]:last:text-right">
          <tbody>
            <tr>
              <td>SignalR State</td>
              <td>
                <p class="flex items-center justify-end gap-2">
                  {#if getConnectionState() === HubConnectionState.Connected}
                    <Wifi class="h-4 w-4 text-green-800" />
                    {getConnectionState()}
                  {:else}
                    <WifiOff class="h-4 w-4 text-red-800" />
                    {getConnectionState()}
                  {/if}
                </p></td
              >
            </tr>
            {#if backendMetadata.State}
              <tr>
                <td>Backend Version</td>
                <td title={`Commit ${backendMetadata.State.commit}`}
                  >{backendMetadata.State.version}</td
                >
              </tr>
            {/if}
          </tbody>
        </table>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</footer>
