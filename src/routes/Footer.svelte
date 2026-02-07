<script lang="ts">
  import { HubConnectionState } from '@microsoft/signalr';
  import { browser } from '$app/environment';
  import { PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import { SignalR_State } from '$lib/signalr';
  import { Wifi, WifiOff } from '@lucide/svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { Button } from '$lib/components/ui/button';

  const version = browser && sessionStorage.getItem('backendVersion');
</script>

<footer
  class="text-muted-foreground text-sm-foreground bottom-0 flex flex-none items-center justify-between px-2"
>
  <div>
    Made with
    <span style="color: #e25555;">&#9829;</span>
    by the <a target="_blank" href={PUBLIC_GITHUB_PROJECT_URL}> OpenShock Team</a>
  </div>
  <div class="flex items-center gap-2">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="icon" class="h-4 w-4">
            {#if $SignalR_State === HubConnectionState.Connected}
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
                  {#if $SignalR_State === HubConnectionState.Connected}
                    <Wifi class="h-4 w-4 text-green-800" />
                    {$SignalR_State}
                  {:else}
                    <WifiOff class="h-4 w-4 text-red-800" />
                    {$SignalR_State}
                  {/if}
                </p></td
              >
            </tr>
            {#if version}
              {@const commit = sessionStorage.getItem('backendCommit')}
              <tr>
                <td>Backend Version</td>
                <td title={commit ? `Commit ${commit}` : undefined}>{version}</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</footer>
