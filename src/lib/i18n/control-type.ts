import { m } from '#lib/paraglide/messages.js';
import { ControlType } from '#lib/signalr/models/ControlType.js';

const labels = {
  Stop: m.control_type_stop,
  Shock: m.control_type_shock,
  Vibrate: m.control_type_vibrate,
  Sound: m.control_type_sound,
} as const;

// Accepts both the SignalR enum value and the API's string name.
export function controlTypeLabel(type: ControlType | keyof typeof labels): string {
  const name = typeof type === 'number' ? ControlType[type] : type;
  return name in labels ? labels[name as keyof typeof labels]() : String(name);
}
