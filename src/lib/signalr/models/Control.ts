import type { ControlType } from '$lib/signalr/models/ControlType';

export interface Control {
  /**
   * The GUID of the shocker to control.
   */
  id: string;

  /**
   * The type of control action to send to the shocker.
   */
  type: ControlType;

  /**
   * The intensity at which to execute the control, expressed as a percentage (0-100).
   */
  intensity: number;

  /**
   * The duration in milliseconds, for which the control should run.
   */
  duration: number;

  /**
   * Whether this control should interrupt any active LiveControl.
   */
  exclusive?: boolean;
}