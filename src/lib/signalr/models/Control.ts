import type { ControlType } from '$lib/signalr/models/ControlType';

export interface Control {
  id: string;
  type: ControlType;
  intensity: number;
  duration: number;
  exclusive?: boolean;
}
