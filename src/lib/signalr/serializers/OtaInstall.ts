import type { HubConnection } from '@microsoft/signalr';

export async function serializeOtaInstallMessage(connection: HubConnection | null, deviceId: string, version: string) {
  if (connection === null) return;
  await connection.send('OtaInstall', deviceId, version);
}
