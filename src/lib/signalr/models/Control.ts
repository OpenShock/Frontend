import type { ControlType } from './ControlType';

export interface Control {
  id: string;
  type: ControlType;
  intensity: number;
  duration: number;
  exclusive?: boolean;
}
