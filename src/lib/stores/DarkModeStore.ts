import { browser } from "$app/environment";
import { writable, type Updater } from "svelte/store";

function getLocalStoreState() {
  const scheme = localStorage.getItem('theme');
  if (scheme === 'dark' || scheme === 'light' || scheme === 'default') {
    return scheme;
  }

  localStorage.setItem('theme', 'default');

  return 'default';
}

function getDarkReaderState() {
  const rootHtml = document.documentElement;

  return {
    isInjected: rootHtml.getAttribute('data-darkreader-proxy-injected') === 'true',
    isActive: rootHtml.querySelector('head meta[name="darkreader"]') !== null,
    scheme: rootHtml.getAttribute('data-darkreader-scheme'),
  };
}

function getColorSchemePreference() {
  // If we are not in a browser environment, return default
  if (!browser) {
    return 'default';
  }

  // Check if local storage has a theme stored
  const localStoreState = getLocalStoreState();
  if (localStoreState !== 'default') {
    return localStoreState;
  }

  // If a user has Dark Reader extension installed, assume they prefer dark mode
  const darkReaderState = getDarkReaderState();
  if (darkReaderState.isInjected) {
    return 'dark';
  }

  // Check if the user has a system theme preference for light mode
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }

  return 'default';
}

const { set, update, subscribe } = writable<'dark' | 'light' | 'default'>(getColorSchemePreference());

function setHtmlDarkModeSelector(value: boolean) {
  document.documentElement.classList.toggle('dark', value);
}

function handleSchemePreferenceChange() {
  const scheme = getColorSchemePreference();
  setHtmlDarkModeSelector(scheme === 'dark');
  set(scheme);
}

export const DarkModeStore = {
  set: (value: 'dark' | 'light' | 'default') => {
    localStorage.setItem('theme', value);
    set(value);
  },
  update: (updater: Updater<'dark' | 'light' | 'default'>) => {
    update((value) => {
      const oldValue = value;
      const newValue = updater(value);
      if (oldValue !== newValue) {
        localStorage.setItem('theme', newValue);
      }
      return newValue;
    });
  },
  subscribe,
};

export function initializeDarkModeStore() {
  const schemePreference = getColorSchemePreference();
  setHtmlDarkModeSelector(schemePreference === 'dark');
  set(schemePreference);

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', handleSchemePreferenceChange);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSchemePreferenceChange);

  window.addEventListener('storage', (event) => {
    if (event.key !== 'theme') return;

    setHtmlDarkModeSelector(event.newValue === 'dark');
  });
}
