import { browser } from '$app/environment';
import { PUBLIC_BACKEND_API_DOMAIN } from '$env/static/public';
import { OwnDeviceStatesStore, type OwnDeviceState } from '$lib/stores/DevicesStore';
import { UserSelfStore } from '$lib/stores/UserStore';
import * as SignalR from '@microsoft/signalr';
import { get, writable } from 'svelte/store';

const signalr_connection = writable<SignalR.HubConnection | null>(null);
const signalr_state = writable<SignalR.HubConnectionState>(SignalR.HubConnectionState.Disconnected);

function isDeviceStatusArray(array: any): array is OwnDeviceState[] {
  if (!array || !Array.isArray(array)) return false;

  for (const item of array) {
    if (Object.hasOwnProperty.call(item, 'device') && typeof item.device !== 'string') {
      return false;
    }

    if (Object.hasOwnProperty.call(item, 'firmwareVersion') && typeof item.firmwareVersion !== 'string') {
      return false;
    }

    if (Object.hasOwnProperty.call(item, 'online') && typeof item.online !== 'boolean') {
      return false;
    }
  }

  return true;
}

async function create_signalr_connection() {
  let connection = get(signalr_connection);
  if (connection) {
    return;
  }

  connection = new SignalR.HubConnectionBuilder()
    .configureLogging(SignalR.LogLevel.Debug)
    .withUrl(`https://${PUBLIC_BACKEND_API_DOMAIN}/1/hubs/user`)
    .build();

  connection.onclose(() => {
    signalr_state.set(SignalR.HubConnectionState.Disconnected);
  });

  connection.onreconnecting(() => {
    signalr_state.set(SignalR.HubConnectionState.Reconnecting);
  });

  connection.onreconnected(() => {
    signalr_state.set(SignalR.HubConnectionState.Connected);
  });

  connection.on('welcome', (message) => {
    console.log(message);
  });

  connection.on('devicestatus', (message) => {
    if (!isDeviceStatusArray(message)) {
      console.error('Received invalid device status message');
      return;
    }

    OwnDeviceStatesStore.set(message);
  });

  connection.on('deviceupdate', (message) => {
    console.log('Received device update message', message);
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

if (browser) {
  UserSelfStore.subscribe((user) => {
    if (!user) {
      destroy_signalr_connection();
    } else {
      create_signalr_connection()
        .then(() => {
          signalr_state.set(SignalR.HubConnectionState.Connected);
        })
        .catch((e) => {
          console.error(e);
          signalr_state.set(SignalR.HubConnectionState.Disconnected);
        });
    }
  });
}

export { signalr_connection, signalr_state };
