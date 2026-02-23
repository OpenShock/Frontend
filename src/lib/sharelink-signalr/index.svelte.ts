import { dev } from '$app/environment';
import type { Control } from '$lib/signalr/models/Control';
import { getBackendURL } from '$lib/utils/url';
import {
  HttpTransportType,
  type HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { toast } from 'svelte-sonner';

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

  private _signalrConnection: HubConnection | null = null;

  private signalr_state = $state<HubConnectionState>(HubConnectionState.Disconnected);

  constructor(shareLinkId: string, customName: string | null) {
    this.shareLinkId = shareLinkId;
    this.customName = customName;
  }

  public async initializeSignalR() {
    if (this._signalrConnection) {
      return;
    }

    console.debug('Initializing Public Share SignalR connection...');

    const connection = new HubConnectionBuilder()
      .configureLogging(dev ? LogLevel.Debug : LogLevel.Warning)
      .withUrl(GetShareLinkURL(this.shareLinkId, this.customName), {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 10000, 15000, 30000, 60000])
      .build();

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

    this._signalrConnection = connection;

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
    if (!this._signalrConnection) return;

    await this._signalrConnection.send('Control', controls);
  }

  public async destroySignalR() {
    if (!this._signalrConnection) return;

    console.debug('Stopping Public Share SignalR connection...');

    try {
      if (this._signalrConnection) {
        await this._signalrConnection.stop();
      }
    } catch (error) {
      console.error(error);
      toast.error('Encountered error while disconnecting from server!');
    } finally {
      this._signalrConnection = null;
      this.signalr_state = HubConnectionState.Disconnected;
    }
  }

  public getState() {
    return this.signalr_state;
  }
}
