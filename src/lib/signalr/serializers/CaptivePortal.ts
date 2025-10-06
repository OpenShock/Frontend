import type { HubConnection } from '@microsoft/signalr';

export async function serializeCaptivePortalMessage(connection: HubConnection | null, deviceId: string, enabled: boolean) {
  if (connection === null) return;
  await connection.send('CaptivePortal', deviceId, enabled);
}
