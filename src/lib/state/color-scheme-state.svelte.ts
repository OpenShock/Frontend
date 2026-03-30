import { isString } from '$lib/typeguards';
import { LocalStorageState } from './classes/local-storage-state.svelte';

export enum ColorScheme {
  Dark = 'dark',
  Light = 'light',
  System = 'system',
}

function isColorSchemeEnum(value: unknown): value is ColorScheme {
  if (!isString(value)) return false;
  return Object.values(ColorScheme).includes(value as ColorScheme);
}

export function getDarkReaderState() {
  const rootHtml = document.documentElement;

  const proxyInjected = rootHtml.getAttribute('data-darkreader-proxy-injected');
  const metaElement = rootHtml.querySelector('head meta[name="darkreader"]');
  const scheme = rootHtml.getAttribute('data-darkreader-scheme');

  return {
    isInjected: proxyInjected === 'true',
    isActive: metaElement !== null,
    scheme,
  };
}

function resolveDarkMode(userPreference: ColorScheme): boolean {
  if (userPreference !== ColorScheme.System) {
    return userPreference !== ColorScheme.Light;
  }

  // If a user has Dark Reader extension installed, assume they prefer dark mode
  const darkReaderState = getDarkReaderState();
  if (darkReaderState.isInjected) {
    return true;
  }

  // Check if the user has a system theme preference for light mode
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return false;
  }

  // Default to dark mode
  return true;
}

function setDarkMode(preference: ColorScheme) {
  document.documentElement.classList.toggle('dark', resolveDarkMode(preference));
}

class ColorSchemeState extends LocalStorageState<ColorScheme> {
  constructor() {
    super('theme', ColorScheme.System);
  }

  override set value(v: ColorScheme) {
    super.value = v;
    setDarkMode(v);
  }

  override get value() {
    return super.value;
  }

  protected override deserialize(raw: string): ColorScheme {
    return isColorSchemeEnum(raw) ? raw : this.defaultValue;
  }

  protected override serialize(value: ColorScheme): string {
    return value;
  }
}

export const colorScheme = new ColorSchemeState();

function handleMediaQueryChange() {
  setDarkMode(colorScheme.value);
}

export function initializeColorScheme() {
  handleMediaQueryChange();

  window
    .matchMedia('(prefers-color-scheme: light)')
    .addEventListener('change', handleMediaQueryChange);
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', handleMediaQueryChange);

  window.addEventListener('storage', (event) => {
    if (event.key !== 'theme') return;

    setDarkMode(isColorSchemeEnum(event.newValue) ? event.newValue : ColorScheme.System);
  });
}
