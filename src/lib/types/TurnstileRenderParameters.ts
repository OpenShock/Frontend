export interface TurnstileRenderParameters {
    sitekey: string;
    action?: string;
    cData?: string;
    callback?: (token: string) => void;
    'error-callback'?: () => void;
    execution?: 'render' | 'execute';
    'expired-callback'?: () => void;
    theme?: 'light' | 'dark' | 'auto';
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
    tabindex?: number;
    'timeout-callback'?: () => void;
    'response-field'?: string;
    'response-field-name'?: string;
    size?: 'normal' | 'compact';
    retry?: 'auto' | 'never';
    'retry-interval'?: number;
    'refresh-expired'?: 'auto' | 'manual' | 'never';
    apperance?: 'always' | 'execute' | 'interaction-only';
}