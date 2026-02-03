import { dev } from '$app/environment';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import {
  HttpTransportType,
  type HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { toast } from 'svelte-sonner';
import { type Readable, get, writable } from 'svelte/store';
import {
  handleSignalrDeviceStatus,
  handleSignalrDeviceUpdate,
  handleSignalrLog,
  handleSignalrOtaInstallFailed,
  handleSignalrOtaInstallProgress,
  handleSignalrOtaInstallStarted,
  handleSignalrOtaInstallSucceeded,
  handleSignalrOtaRollback,
} from './handlers';

const signalr_connection = writable<HubConnection | null>(null);
const signalr_state = writable<HubConnectionState>(HubConnectionState.Disconnected);

export async function initializeSignalR() {
  let connection = get(signalr_connection);
  if (connection) {
    return;
  }

  connection = new HubConnectionBuilder()
    .configureLogging(dev ? LogLevel.Debug : LogLevel.Warning)
    .withUrl(new URL(`1/hubs/user`, PUBLIC_BACKEND_API_URL).toString(), {
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

  // Look up in OpenShock API repository: Common/Hubs/IUserHub.cs
  connection.on('Welcome', () => {
    // Arg is the SignalR connectionId
    signalr_state.set(HubConnectionState.Connected);
  });

  connection.on('Log', handleSignalrLog);

  connection.on('DeviceStatus', handleSignalrDeviceStatus);
  connection.on('DeviceUpdate', handleSignalrDeviceUpdate);

  connection.on('OtaInstallStarted', handleSignalrOtaInstallStarted);
  connection.on('OtaInstallProgress', handleSignalrOtaInstallProgress);
  connection.on('OtaInstallSucceeded', handleSignalrOtaInstallSucceeded);
  connection.on('OtaInstallFailed', handleSignalrOtaInstallFailed);
  connection.on('OtaRollback', handleSignalrOtaRollback);

  signalr_connection.set(connection);

  try {
    await connection.start();
    signalr_state.set(HubConnectionState.Connected);
  } catch (error) {
    console.error(error);
    toast.error('Failed to connect to server!');
    signalr_state.set(HubConnectionState.Disconnected);
  }
}

export async function destroySignalR() {
  if (!signalr_connection) return;

  try {
    const connection = get(signalr_connection);
    if (connection) {
      await connection.stop();
    }
  } catch (error) {
    console.error(error);
    toast.error('Encountered error while disconnecting from server!');
  } finally {
    signalr_connection.set(null);
    signalr_state.set(HubConnectionState.Disconnected);
  }
}

export const SignalR_State = {
  subscribe: signalr_state.subscribe,
} as Readable<HubConnectionState>;

export const SignalR_Connection = {
  subscribe: signalr_connection.subscribe,
} as Readable<HubConnection | null>;
