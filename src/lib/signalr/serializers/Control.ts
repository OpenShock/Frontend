import { HubConnection } from '@microsoft/signalr';
import type { Control } from '../models/Control';

export async function serializeControlMessages(connection: HubConnection, controls: Control[]) {
  await connection.send(
    'ControlV2',
    controls.map((control) => ({
      ...control,
      duration: control.duration * 1000,
    })),
    null
  );
}
