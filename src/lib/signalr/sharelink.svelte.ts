import type { Control } from '$lib/signalr/models/Control';
import { getBackendURL } from '$lib/utils/url';
import { type HubConnection, HubConnectionState } from '@microsoft/signalr';
import { toast } from 'svelte-sonner';
import { BuildSignalrConnection } from './utils/connection-builder';

function GetShareLinkURL(shareLinkId: string, customName: string | null) {
  const url = getBackendURL(`1/hubs/share/link/${encodeURIComponent(shareLinkId)}`);
  if (customName !== null) {
    url.searchParams.set('name', customName || '');
  }
  return url.href;
}

export class ShareLinkSignalr {
  readonly shareLinkId: string;
  readonly customName: string | null;

  #connection: HubConnection | null = null;

  private signalr_state = $state<HubConnectionState>(HubConnectionState.Disconnected);

  constructor(shareLinkId: string, customName: string | null) {
    this.shareLinkId = shareLinkId;
    this.customName = customName;
  }

  public async initializeSignalR() {
    if (this.#connection) {
      return;
    }

    console.debug('Initializing Public Share SignalR connection...');

    const connection = BuildSignalrConnection(GetShareLinkURL(this.shareLinkId, this.customName));

    connection.onclose(() => {
      this.signalr_state = HubConnectionState.Disconnected;
    });

    connection.onreconnecting(() => {
      this.signalr_state = HubConnectionState.Reconnecting;
    });

    connection.onreconnected(() => {
      this.signalr_state = HubConnectionState.Connected;
    });

    // Look up in OpenShock API repository: Common/Hubs/IPublicShareHub.cs
    connection.on('Welcome', (/* authType */) => {
      this.signalr_state = HubConnectionState.Connected;
    });

    connection.on('Updated', () => {
      // Refetch share link data
    });

    this.#connection = connection;

    try {
      await connection.start();
      this.signalr_state = HubConnectionState.Connected;
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect to server!');
      this.signalr_state = HubConnectionState.Disconnected;
    }
  }

  public async control(controls: Control[]) {
    if (!this.#connection) return;

    await this.#connection.send('Control', controls);
  }

  public async destroySignalR() {
    if (!this.#connection) return;

    console.debug('Stopping Public Share SignalR connection...');

    try {
      if (this.#connection) {
        await this.#connection.stop();
      }
    } catch (error) {
      console.error(error);
      toast.error('Encountered error while disconnecting from server!');
    } finally {
      this.#connection = null;
      this.signalr_state = HubConnectionState.Disconnected;
    }
  }

  public getState() {
    return this.signalr_state;
  }
}
