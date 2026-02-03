<script lang="ts">
  import { HubConnectionState } from '@microsoft/signalr';
  import { browser } from '$app/environment';
  import { PUBLIC_GITHUB_PROJECT_URL } from '$env/static/public';
  import { SignalR_State } from '$lib/signalr';

  const version = browser && sessionStorage.getItem('backendVersion');
</script>

<footer class="bottom-0 flex flex-none items-center justify-between px-2 text-sm">
  <div>
    Made with
    <span style="color: #e25555;">&#9829;</span>
    by the <a target="_blank" href={PUBLIC_GITHUB_PROJECT_URL}> OpenShock Team</a>
  </div>
  <div>
    {#if version}
      {@const commit = sessionStorage.getItem('backendCommit')}
      <span title={commit ? `Commit ${commit}` : undefined} class="text-blue-500">
        API {version}
      </span>
    {/if}
    <span
      class={$SignalR_State === HubConnectionState.Connected ? 'text-green-500' : 'text-red-500'}
    >
      {$SignalR_State}
    </span>
  </div>
</footer>
