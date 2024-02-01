import type { TurnstileRenderParameters } from './TurnstileRenderParameters';

export interface TurnstileInstance {
  execute: (
    container: string | HTMLElement,
    jsParams: TurnstileRenderParameters
  ) => Promise<string>;
  getResponse: (container: string | HTMLElement) => string;
  implicitRender: () => void;
  ready: (callback: (token: string) => void) => void;
  remove: (container: string | HTMLElement) => void;
  render: (container: string | HTMLElement, parameters: TurnstileRenderParameters) => void;
  reset: (container: string | HTMLElement) => void;
}
