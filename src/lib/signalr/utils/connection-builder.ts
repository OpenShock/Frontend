import { dev } from '$app/environment';
import { HttpTransportType, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export function BuildSignalrConnection(url: string) {
  return new HubConnectionBuilder()
    .configureLogging(dev ? LogLevel.Debug : LogLevel.Warning)
    .withUrl(url, {
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 10000, 15000, 30000, 60000])
    .build();
}
