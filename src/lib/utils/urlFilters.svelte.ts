import { goto } from '$app/navigation';
import { page } from '$app/state';
import { untrack } from 'svelte';

type ParamTypeMap = {
  number: number;
  string: string;
};

export type ParamDef = {
  [K in keyof ParamTypeMap]: {
    type: K;
    default?: ParamTypeMap[K] | null;
  };
}[keyof ParamTypeMap];

// Resolved value type for a single param definition:
//  - `{ type: 'number' }`                → number | undefined
//  - `{ type: 'number', default: null }`  → number | null | undefined
//  - `{ type: 'string' }`                → string | undefined
type FilterValueFor<D extends ParamDef> = null extends D['default']
  ? ParamTypeMap[D['type']] | null | undefined
  : ParamTypeMap[D['type']] | undefined;

export type FilterState<T extends Record<string, ParamDef>> = {
  -readonly [K in keyof T]: FilterValueFor<T[K]>;
};

// Internal broadest value type used in records that mix all param kinds
type FilterValue = string | number | null | undefined;

// Sentinel used to represent null in URL params and localStorage
const NULL_SENTINEL = '__null__';

function parseValue(
  type: ParamDef['type'],
  raw: string | null,
  defaultValue?: FilterValue
): FilterValue {
  if (raw === null || raw === '') return defaultValue;
  if (raw === NULL_SENTINEL) return null;

  if (type === 'number') {
    const n = Number(raw);
    return isNaN(n) ? defaultValue : n;
  }

  return raw;
}

/**
 * Creates a reactive filter state object that syncs bidirectionally with URL query parameters.
 *
 * Must be called at component initialisation time (top-level in a <script> block, or inside
 * a function that is called during component init — same rules as Svelte runes).
 *
 * On mount the state is seeded from the current URL, falling back to any declared default.
 * Whenever a filter value changes, the URL is updated with replaceState so the address bar
 * always reflects the current filter state and users can copy/share the link.
 *
 * @example
 *   const filters = createUrlFilters({
 *     companyId: { type: 'number' },
 *     year:      { type: 'number', default: new Date().getFullYear() },
 *     search:    { type: 'string' },
 *     categoryId: { type: 'number' },
 *   } as const satisfies Record<string, ParamDef>);
 *
 *   // Bind directly to components:
 *   <ComboBox bind:selectedId={filters.companyId} ... />
 *
 *   // Read in derived/effect just like any $state property:
 *   $effect(() => { if (filters.companyId) loadData(filters.companyId); });
 */
export function createUrlFilters<T extends Record<string, ParamDef>>(
  defs: T,
  options?: { storageKey?: string }
): FilterState<T> {
  // Load saved filters from localStorage if a storageKey is provided
  const storageKey = options?.storageKey;
  let saved: Record<string, FilterValue> = {};
  if (storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch {
      // ignore corrupt data
    }
  }

  // Seed initial values from URL, then localStorage, then declared defaults
  const init: Record<string, FilterValue> = {};
  for (const [key, def] of Object.entries(defs)) {
    const fromUrl = page.url.searchParams.get(key);
    if (fromUrl !== null && fromUrl !== '') {
      init[key] = parseValue(def.type, fromUrl, def.default);
    } else if (key in saved) {
      init[key] = saved[key];
    } else {
      init[key] = def.default;
    }
  }

  const state = $state(init) as FilterState<T>;
  const keys = Object.keys(defs);

  // Whenever any filter value changes, update the URL with replaceState so the
  // address bar stays in sync without adding a history entry.
  // page.url is read inside untrack() so URL changes caused by our own goto
  // call do not re-trigger this effect (avoids an infinite loop).
  $effect(() => {
    // Snapshot all tracked state values before entering untrack
    const snapshot: Record<string, FilterValue> = {};
    for (const key of keys) {
      snapshot[key] = (state as Record<string, FilterValue>)[key];
    }

    untrack(() => {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const params = new URLSearchParams(page.url.searchParams);
      for (const key of keys) {
        const value = snapshot[key];
        if (value === null) {
          params.set(key, NULL_SENTINEL);
        } else if (value !== undefined) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      }
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      goto(`?${params}`, { replaceState: true, keepFocus: true, noScroll: true });

      // Persist to localStorage so filters survive navigation
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(snapshot));
        } catch {
          // storage full or unavailable — silently ignore
        }
      }
    });
  });

  return state;
}
