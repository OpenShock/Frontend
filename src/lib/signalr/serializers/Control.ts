import type { HubConnection } from '@microsoft/signalr';
import type { Control } from '../models/Control';

export async function serializeControlMessages(connection: HubConnection, controls: Control[]) {
  await connection.send(
    'ControlV2',
    controls.map((control) => ({
      ...control,
      intensity: Math.round(control.intensity),
      duration: Math.round(control.duration * 1000),
    })),
    null
  );
}
