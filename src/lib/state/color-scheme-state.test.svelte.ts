import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

function makeMatchMedia(prefersLight: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: light)' ? prefersLight : !prefersLight,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

// jsdom has no matchMedia — stub before the module is loaded so the singleton
// constructor does not throw if it ever calls matchMedia during init.
Object.defineProperty(window, 'matchMedia', { value: makeMatchMedia(false), writable: true });

const { colorScheme, getDarkReaderState, initializeColorScheme, ColorScheme } =
  await import('./color-scheme-state.svelte');

const cleanDom = () => {
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-darkreader-proxy-injected');
  document.documentElement.removeAttribute('data-darkreader-scheme');
  document.head.querySelectorAll('meta[name="darkreader"]').forEach((el) => el.remove());
};

describe('getDarkReaderState', () => {
  beforeEach(cleanDom);
  afterEach(cleanDom);

  it('returns defaults when no DarkReader attributes are present', () => {
    expect(getDarkReaderState()).toEqual({ isInjected: false, isActive: false, scheme: null });
  });

  it('detects proxy-injected=true', () => {
    document.documentElement.setAttribute('data-darkreader-proxy-injected', 'true');
    expect(getDarkReaderState().isInjected).toBe(true);
  });

  it('does not treat proxy-injected=false as injected', () => {
    document.documentElement.setAttribute('data-darkreader-proxy-injected', 'false');
    expect(getDarkReaderState().isInjected).toBe(false);
  });

  it('detects active DarkReader meta element', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'darkreader');
    document.head.appendChild(meta);
    expect(getDarkReaderState().isActive).toBe(true);
  });

  it('reads scheme attribute', () => {
    document.documentElement.setAttribute('data-darkreader-scheme', 'dark');
    expect(getDarkReaderState().scheme).toBe('dark');
  });

  it('returns null scheme when attribute is absent', () => {
    expect(getDarkReaderState().scheme).toBeNull();
  });
});

describe('colorScheme singleton', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = makeMatchMedia(false);
    cleanDom();
  });

  afterEach(() => {
    colorScheme.reset();
  });

  it('has System as default value', () => {
    expect(colorScheme.defaultValue).toBe(ColorScheme.System);
  });

  it('setting to Dark adds dark class to <html>', () => {
    colorScheme.value = ColorScheme.Dark;
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setting to Light removes dark class from <html>', () => {
    colorScheme.value = ColorScheme.Dark;
    colorScheme.value = ColorScheme.Light;
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('System with prefers-light removes dark class', () => {
    window.matchMedia = makeMatchMedia(true);
    colorScheme.value = ColorScheme.System;
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('System without prefers-light defaults to dark', () => {
    window.matchMedia = makeMatchMedia(false);
    colorScheme.value = ColorScheme.System;
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('System with DarkReader injected stays dark even when system prefers light', () => {
    window.matchMedia = makeMatchMedia(true);
    document.documentElement.setAttribute('data-darkreader-proxy-injected', 'true');
    colorScheme.value = ColorScheme.System;
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists value to localStorage under the "theme" key', () => {
    colorScheme.value = ColorScheme.Dark;
    expect(localStorage.getItem('theme')).toBe('dark');

    colorScheme.value = ColorScheme.Light;
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('reset removes the storage key and reverts to System', () => {
    colorScheme.value = ColorScheme.Dark;
    colorScheme.reset();
    expect(colorScheme.value).toBe(ColorScheme.System);
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('picks up ColorScheme.Light via cross-tab storage event', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'theme',
        newValue: ColorScheme.Light,
        storageArea: localStorage,
      }),
    );
    expect(colorScheme.value).toBe(ColorScheme.Light);
  });

  it('falls back to System for invalid cross-tab storage event values', () => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'theme',
        newValue: 'bogus-scheme',
        storageArea: localStorage,
      }),
    );
    expect(colorScheme.value).toBe(ColorScheme.System);
  });

  it('ignores storage events for unrelated keys', () => {
    colorScheme.value = ColorScheme.Dark;
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'other-key',
        newValue: ColorScheme.Light,
        storageArea: localStorage,
      }),
    );
    expect(colorScheme.value).toBe(ColorScheme.Dark);
  });
});

describe('initializeColorScheme', () => {
  it('applies dark mode immediately and attaches change listeners to both media queries', () => {
    const addEventListenerMock = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    });

    initializeColorScheme();

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: light)');
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(addEventListenerMock).toHaveBeenCalledTimes(2);
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
