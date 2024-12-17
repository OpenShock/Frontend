export interface TurnstileRenderParameters {
  /**
   * Every widget has a sitekey.
   *
   * This sitekey is associated with the corresponding widget configuration and is created upon the widget creation.
   */
  sitekey: string;

  /**
   * A customer value that can be used to differentiate widgets under the same sitekey in analytics and which is returned upon validation.
   *
   * This can only contain up to 32 alphanumeric characters including _ and -.
   */
  action?: string;

  /**
   * A customer payload that can be used to attach customer data to the challenge throughout its issuance and which is returned upon validation.
   *
   * This can only contain up to 255 alphanumeric characters including _ and -.
   */
  cData?: string;

  /**
   * A JavaScript callback invoked upon success of the challenge.
   *
   * The callback is passed a token that can be validated.
   */
  callback?: (token: string) => void;

  /**
   * A JavaScript callback invoked when there is an error (e.g. network error or the challenge failed).
   *
   * Refer to {@link https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/|Client-side errors}.
   */
  'error-callback'?: () => void;

  /**
   * Execution controls when to obtain the token of the widget and can be on render (default) or on execute.
   *
   * Refer to {@link https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#execution-modes|Execution Modes} for more information.
   */
  execution?: 'render' | 'execute';

  /**
   * A JavaScript callback invoked when the token expires and does not reset the widget.
   */
  'expired-callback'?: () => void;

  /**
   * A JavaScript callback invoked before the challenge enters interactive mode.
   */
  'before-interactive-callback'?: () => void;

  /**
   * A JavaScript callback invoked when challenge has left interactive mode.
   */
  'after-interactive-callback'?: () => void;

  /**
   * A JavaScript callback invoked when a given client/browser is not supported by Turnstile.
   */
  'unsupported-callback'?: () => void;

  /**
   * The widget theme. Can take the following values: light, dark, auto.
   *
   * The default is auto, which respects the user preference. This can be forced to light or dark by setting the theme accordingly.
   */
  theme?: 'light' | 'dark' | 'auto';

  /**
   * Language to display, must be either: auto (default) to use the language that the visitor has chosen, or an ISO 639-1 two-letter language code (e.g. en) or language and country code (e.g. en-US).
   *
   * Refer to the {@link https://developers.cloudflare.com/turnstile/reference/supported-languages/|list of supported languages} for more information.
   */
  language?:
    | 'auto'
    | 'ar-eg'
    | 'de'
    | 'en'
    | 'es'
    | 'fa'
    | 'fr'
    | 'id'
    | 'it'
    | 'ja'
    | 'ko'
    | 'nl'
    | 'pl'
    | 'pt-br'
    | 'ru'
    | 'tr'
    | 'zh-cn'
    | 'zh-tw';

  /**
   * The tabindex of Turnstile's iframe for accessibility purposes.
   *
   * The default value is 0.
   */
  tabindex?: number;

  /**
   * A JavaScript callback invoked when the challenge presents an interactive challenge but was not solved within a given time.
   *
   * A callback will reset the widget to allow a visitor to solve the challenge again.
   */
  'timeout-callback'?: () => void;

  /**
   * A boolean that controls if an input element with the response token is created, defaults to true.
   */
  'response-field'?: boolean;

  /**
   * Name of the input element, defaults to cf-turnstile-response.
   */
  'response-field-name'?: string;

  /**
   * The widget size. Can take the following values: normal, flexible, compact.
   */
  size?: 'normal' | 'flexible' | 'compact';

  /**
   * Controls whether the widget should automatically retry to obtain a token if it did not succeed. The default is auto, which will retry automatically.
   *
   * This can be set to never to disable retry on failure.
   */
  retry?: 'auto' | 'never';

  /**
   * When retry is set to auto, retry-interval controls the time between retry attempts in milliseconds.
   *
   * Value must be a positive integer less than 900000, defaults to 8000.
   */
  'retry-interval'?: number;

  /**
   * Automatically refreshes the token when it expires.
   *
   * Can take auto, manual, or never, defaults to auto.
   */
  'refresh-expired'?: 'auto' | 'manual' | 'never';

  /**
   * Controls whether the widget should automatically refresh upon entering an interactive challenge and observing a timeout.
   *
   * Can take auto (automatically refreshes upon encountering an interactive timeout), manual (prompts the visitor to manually refresh) or never (will show a timeout), defaults to auto.
   *
   * Only applies to widgets of mode managed.
   */
  'refresh-timeout'?: 'auto' | 'manual' | 'never';

  /**
   * Appearance controls when the widget is visible. It can be always (default), execute, or interaction-only.
   *
   * Refer to {@link https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#appearance-modes|Appearance modes} for more information.
   */
  apperance?: 'always' | 'execute' | 'interaction-only';

  /**
   * Allows Cloudflare to gather visitor feedback upon widget failure.
   *
   * It can be true (default) or false.
   */
  'feedback-enabled'?: boolean;
}
