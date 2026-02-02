import { metaApi } from '$lib/api';
import { initializeSignalR } from '$lib/signalr';
import { initializeDarkModeStore } from '$lib/stores/ColorSchemeStore.svelte';
import { initializeSerialPortsStore } from '$lib/stores/SerialPortsStore';
import { UserStore } from '$lib/stores/UserStore';

export async function init() {
  const {
    data: { version, commit, shortLinkUrl, turnstileSiteKey, oAuthProviders, isUserAuthenticated },
  } = await metaApi.versionGetBackendInfo();

  if (version != null) sessionStorage.setItem('backendVersion', String(version));
  if (commit != null) sessionStorage.setItem('backendCommit', String(commit));
  if (shortLinkUrl != null) sessionStorage.setItem('shortLinkUrl', String(shortLinkUrl));
  if (turnstileSiteKey != null)
    sessionStorage.setItem('turnstileSiteKey', String(turnstileSiteKey));
  if (oAuthProviders != null)
    sessionStorage.setItem('oAuthProviders', JSON.stringify(oAuthProviders));

  // init client-side stores
  initializeDarkModeStore();
  initializeSerialPortsStore(); // TODO: move this elsewhere if needed

  // Attempt to authenticate the user if backend says they are authenticated
  if (isUserAuthenticated) {
    // fire both requests in parallel
    await Promise.all([UserStore.refreshSelf(), initializeSignalR()]);
  }
}

export function handleError() {}
