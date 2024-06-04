import { browser } from '$app/environment';
import { PUBLIC_BACKEND_API_DOMAIN } from '$env/static/public';
import * as SignalR from '@microsoft/signalr';
import { writable } from 'svelte/store';

var signalr_connection: SignalR.HubConnection | null = null;
const signalr_state = writable<SignalR.HubConnectionState>(SignalR.HubConnectionState.Disconnected);

if (browser && !signalr_connection) {
  signalr_connection = new SignalR.HubConnectionBuilder()
    .configureLogging(SignalR.LogLevel.Information)
    .withUrl(`https://${PUBLIC_BACKEND_API_DOMAIN}/1/hubs/user`)
    .build();

  signalr_connection.onclose(() => {
    signalr_state.set(SignalR.HubConnectionState.Disconnected);
  });

  signalr_connection.onreconnecting(() => {
    signalr_state.set(SignalR.HubConnectionState.Reconnecting);
  });

  signalr_connection.onreconnected(() => {
    signalr_state.set(SignalR.HubConnectionState.Connected);
  });

  signalr_connection.start()
    .then(() => {
      signalr_state.set(SignalR.HubConnectionState.Connected);
    })
    .catch((error) => {
      console.error(error);
      signalr_state.set(SignalR.HubConnectionState.Disconnected);
    });
}

export { signalr_connection, signalr_state };
