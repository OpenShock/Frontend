import { browser } from '$app/environment';
import { PUBLIC_BACKEND_API_DOMAIN } from '$env/static/public';
import { OnlineDevicesStore, refreshOwnDevices, type DeviceOnlineState } from '$lib/stores/DevicesStore';
import { UserStore } from '$lib/stores/UserStore';
import * as SR from '@microsoft/signalr';
import { get, writable, type Readable } from 'svelte/store';

const signalr_connection = writable<SR.HubConnection | null>(null);
const signalr_state = writable<SR.HubConnectionState>(SR.HubConnectionState.Disconnected);

function isDeviceStatusArray(array: unknown): array is DeviceOnlineState[] {
  if (!Array.isArray(array)) {
    return false;
  }

  console.log(array);

  return array.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'device' in item &&
    'online' in item &&
    'firmwareVersion' in item &&
    typeof item.device === 'string' &&
    typeof item.online === 'boolean' &&
    (typeof item.firmwareVersion === 'string' || item.firmwareVersion === null)
  );
}

async function create_signalr_connection() {
  let connection = get(signalr_connection);
  if (connection) {
    return;
  }

  connection = new SR.HubConnectionBuilder()
    .configureLogging(SR.LogLevel.Debug)
    .withUrl(`https://${PUBLIC_BACKEND_API_DOMAIN}/1/hubs/user`, {
      transport: SR.HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 10000, 15000, 30000, 60000])
    .build();

  connection.onclose(() => {
    signalr_state.set(SR.HubConnectionState.Disconnected);
  });

  connection.onreconnecting(() => {
    signalr_state.set(SR.HubConnectionState.Reconnecting);
  });

  connection.onreconnected(() => {
    signalr_state.set(SR.HubConnectionState.Connected);
  });

  connection.on('welcome', (message) => {
    console.log(message);
  });

  connection.on('devicestatus', (devices) => {
    console.log('Device status received!');
    if (!isDeviceStatusArray(devices)) {
      console.error('Received invalid device status message', devices);
      return;
    }

    OnlineDevicesStore.update((state) => {
      devices.forEach((entry) => {
        state.set(entry.device, entry);
      });

      return state;
    });
  });

  connection.on('deviceupdate', (message) => {
    console.log('Received device update message', message);
    refreshOwnDevices();
  });

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
  subscribe: signalr_state.subscribe
} as Readable<SR.HubConnectionState>;

export const SignalR_Connection = {
  subscribe: signalr_connection.subscribe
} as Readable<SR.HubConnection | null>;

export function initializeSignalR() {
  if (!browser) return;

  UserStore.subscribe(({ self }) => {
    if (self === null) {
      destroy_signalr_connection();
    } else {
      create_signalr_connection()
        .then(() => {
          signalr_state.set(SR.HubConnectionState.Connected);
        })
        .catch((e) => {
          console.error(e);
          signalr_state.set(SR.HubConnectionState.Disconnected);
        });
    }
  });
}

