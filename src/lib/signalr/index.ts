import {
  HttpTransportType,
  type HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { browser, dev } from '$app/environment';
import { PUBLIC_BACKEND_API_DOMAIN } from '$env/static/public';
import { UserStore } from '$lib/stores/UserStore';
import { toast } from 'svelte-sonner';
import { type Readable, get, writable } from 'svelte/store';
import { handleSignalrDeviceState } from './handlers/DeviceStatus';
import { handleSignalrDeviceUpdate } from './handlers/DeviceUpdate';
import {
  handleSignalrOtaInstallProgress,
  handleSignalrOtaInstallStarted,
  handleSignalrOtaInstallSucceeded,
} from './handlers/OtaInstall';

const signalr_connection = writable<HubConnection | null>(null);
const signalr_state = writable<HubConnectionState>(HubConnectionState.Disconnected);

async function create_signalr_connection() {
  let connection = get(signalr_connection);
  if (connection) {
    return;
  }

  connection = new HubConnectionBuilder()
    .configureLogging(dev ? LogLevel.Debug : LogLevel.Information)
    .withUrl(`https://${PUBLIC_BACKEND_API_DOMAIN}/1/hubs/user`, {
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 10000, 15000, 30000, 60000])
    .build();

  connection.onclose(() => {
    signalr_state.set(HubConnectionState.Disconnected);
  });

  connection.onreconnecting(() => {
    signalr_state.set(HubConnectionState.Reconnecting);
  });

  connection.onreconnected(() => {
    signalr_state.set(HubConnectionState.Connected);
  });

  connection.on('Welcome', (message) => {
    console.log(message);
  });

  connection.on('Log', () => {});

  connection.on('DeviceStatus', handleSignalrDeviceState);
  connection.on('DeviceUpdate', handleSignalrDeviceUpdate);
  connection.on('OtaInstallStarted', handleSignalrOtaInstallStarted);
  connection.on('OtaInstallProgress', handleSignalrOtaInstallProgress);
  connection.on('OtaInstallSucceeded', handleSignalrOtaInstallSucceeded);

  signalr_connection.set(connection);

  await connection.start();
}

function destroy_signalr_connection() {
  if (signalr_connection) {
    const connection = get(signalr_connection);
    if (connection) {
      connection.stop();
      signalr_connection.set(null);
    }
  }
}

export const SignalR_State = {
  subscribe: signalr_state.subscribe,
} as Readable<HubConnectionState>;

export const SignalR_Connection = {
  subscribe: signalr_connection.subscribe,
} as Readable<HubConnection | null>;

export function initializeSignalR() {
  if (!browser) return;

  UserStore.subscribe(({ self }) => {
    if (self === null) {
      destroy_signalr_connection();
    } else {
      create_signalr_connection()
        .then(() => {
          signalr_state.set(HubConnectionState.Connected);
        })
        .catch((e) => {
          console.error(e);
          toast.error('Failed to connect to server!');
          signalr_state.set(HubConnectionState.Disconnected);
        });
    }
  });
}
