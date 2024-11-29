import type { TurnstileRenderParameters } from './TurnstileRenderParameters';

export interface TurnstileInstance {
  execute: (
    container: string | HTMLElement,
    jsParams: TurnstileRenderParameters
  ) => Promise<string>;
  getResponse: (container: string | HTMLElement) => string;
  implicitRender: () => void;
  ready: (callback: (token: string) => void) => void;

  /**
   * Programatically loads turnstile
   * @param container reference to a HTML widget
   * @param parameters render parameters
   * @returns Returns a widgetId if successful, else returns undefined.
   */
  render: (container: string | HTMLElement, parameters: TurnstileRenderParameters) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}
