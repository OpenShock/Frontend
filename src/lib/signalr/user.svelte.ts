import { getBackendURL } from '$lib/utils/url';
import { type HubConnection, HubConnectionState } from '@microsoft/signalr';
import { toast } from 'svelte-sonner';
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
import { BuildSignalrConnection } from './utils/connection-builder';

const BackendHubUserUrl = getBackendURL('1/hubs/user').href;

let connection = $state<HubConnection | null>(null);
let connectionState = $state<HubConnectionState>(HubConnectionState.Disconnected);

export function getConnection(): HubConnection | null {
  return connection;
}

export function getConnectionState(): HubConnectionState {
  return connectionState;
}

export async function initializeSignalR() {
  if (connection) {
    return;
  }

  connection = BuildSignalrConnection(BackendHubUserUrl);

  connection.onclose(() => {
    connectionState = HubConnectionState.Disconnected;
  });

  connection.onreconnecting(() => {
    connectionState = HubConnectionState.Reconnecting;
  });

  connection.onreconnected(() => {
    connectionState = HubConnectionState.Connected;
  });

  // Look up in OpenShock API repository: Common/Hubs/IUserHub.cs
  connection.on('Welcome', () => {
    // Arg is the SignalR connectionId
    connectionState = HubConnectionState.Connected;
  });

  connection.on('Log', handleSignalrLog);

  connection.on('DeviceStatus', handleSignalrDeviceStatus);
  connection.on('DeviceUpdate', handleSignalrDeviceUpdate);

  connection.on('OtaInstallStarted', handleSignalrOtaInstallStarted);
  connection.on('OtaInstallProgress', handleSignalrOtaInstallProgress);
  connection.on('OtaInstallSucceeded', handleSignalrOtaInstallSucceeded);
  connection.on('OtaInstallFailed', handleSignalrOtaInstallFailed);
  connection.on('OtaRollback', handleSignalrOtaRollback);

  try {
    await connection.start();
    connectionState = HubConnectionState.Connected;
  } catch (error) {
    console.error(error);
    toast.error('Failed to connect to server!');
    connectionState = HubConnectionState.Disconnected;
  }
}

export async function destroySignalR() {
  if (!connection) return;

  try {
    await connection.stop();
  } catch (error) {
    console.error(error);
    toast.error('Encountered error while disconnecting from server!');
  } finally {
    connection = null;
    connectionState = HubConnectionState.Disconnected;
  }
}
