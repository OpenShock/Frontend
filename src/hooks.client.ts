import { metaApi } from '$lib/api';
import { initializeSignalR } from '$lib/signalr';
import { initializeDarkModeStore } from '$lib/stores/ColorSchemeStore.svelte';
import { initializeSerialPortsStore } from '$lib/stores/SerialPortsStore';
import { UserStore } from '$lib/stores/UserStore';

export async function init() {
  // fire both requests in parallel
  const [backendInfoRes, userRes] = await Promise.allSettled([
    metaApi.versionGetBackendVersion(),
    UserStore.refreshSelf(),
  ]);

  // handle backend info
  if (backendInfoRes.status === 'fulfilled' && backendInfoRes.value?.data) {
    const { version, commit, shortLinkUrl, turnstileSiteKey } = backendInfoRes.value.data;

    if (version != null) sessionStorage.setItem('backendVersion', String(version));
    if (commit != null) sessionStorage.setItem('backendCommit', String(commit));
    if (shortLinkUrl != null) sessionStorage.setItem('shortLinkUrl', String(shortLinkUrl));
    if (turnstileSiteKey != null)
      sessionStorage.setItem('turnstileSiteKey', String(turnstileSiteKey));
  } else {
    throw new Error('Failed to fetch backend info');
  }

  // init client-side stores
  initializeDarkModeStore();
  initializeSerialPortsStore(); // TODO: move this elsewhere if needed

  // start SignalR only if we have a user
  const isLoggedIn = userRes.status === 'fulfilled' && !!userRes.value;
  if (isLoggedIn) {
    await initializeSignalR();
  }
}
