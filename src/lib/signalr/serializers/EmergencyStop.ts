import type { HubConnection } from '@microsoft/signalr';

export async function serializeEmergencyStopMessage(
  connection: HubConnection | null,
  deviceId: string
) {
  if (connection === null) return;
  await connection.send('EmergencyStop', deviceId);
}
