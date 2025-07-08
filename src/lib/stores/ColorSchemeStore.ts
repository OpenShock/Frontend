import { browser } from '$app/environment';
import { type Updater, writable } from 'svelte/store';

export enum LightMode {
  Dark = 'dark',
  Light = 'light',
  System = 'system',
}

function getLocalStoreState(): LightMode {
  const scheme = localStorage.getItem('theme');
  if (scheme !== null && Object.values(LightMode).includes(scheme as LightMode)) {
    return scheme as LightMode;
  }

  localStorage.setItem('theme', LightMode.System);

  return LightMode.System;
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

function getColorSchemePreference(): LightMode {
  // If we are not in a browser environment, return default
  if (!browser) {
    return LightMode.System;
  }

  // Check if local storage has a theme stored
  const localStoreState = getLocalStoreState();
  if (localStoreState !== LightMode.System) {
    return localStoreState;
  }

  // If a user has Dark Reader extension installed, assume they prefer dark mode
  const darkReaderState = getDarkReaderState();
  if (darkReaderState.isInjected) {
    return LightMode.Dark;
  }

  // Check if the user has a system theme preference for light mode
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return LightMode.Light;
  }

  // Default to dark mode
  return LightMode.Dark;
}

const { set, update, subscribe } = writable<LightMode>(getColorSchemePreference());

function setHtmlDarkModeSelector(value: boolean) {
  document.documentElement.classList.toggle('dark', value);
}

function handleSchemePreferenceChange() {
  const scheme = getColorSchemePreference();
  setHtmlDarkModeSelector(scheme === LightMode.Dark);
}

export const ColorSchemeStore = {
  set: (value: LightMode) => {
    localStorage.setItem('theme', value);
    set(value);
    handleSchemePreferenceChange();
  },
  update: (updater: Updater<LightMode>) => {
    update((value) => {
      const oldValue = value;
      const newValue = updater(value);
      if (oldValue !== newValue) {
        setHtmlDarkModeSelector(newValue === LightMode.Dark);
        localStorage.setItem('theme', newValue);
      }
      return newValue;
    });
  },
  subscribe,
};

export function initializeDarkModeStore() {
  const schemePreference = getColorSchemePreference();
  setHtmlDarkModeSelector(schemePreference === LightMode.Dark);

  window
    .matchMedia('(prefers-color-scheme: light)')
    .addEventListener('change', handleSchemePreferenceChange);
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', handleSchemePreferenceChange);

  window.addEventListener('storage', (event) => {
    if (event.key !== 'theme') return;

    setHtmlDarkModeSelector(event.newValue === LightMode.Dark);
  });
}
