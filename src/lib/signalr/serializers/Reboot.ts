import type { HubConnection } from '@microsoft/signalr';

export async function serializeRebootMessage(connection: HubConnection | null, deviceId: string) {
  if (connection === null) return;
  await connection.send('Reboot', deviceId);
}
