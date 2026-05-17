/**
 * Tiny localStorage-backed key/value store where each entry has an absolute
 * expiry. Entries past their expiry read as missing and are pruned in bulk on
 * startup via {@link clearExpired}.
 *
 * Stored under a single localStorage key so prune/read/write are one
 * serialize round-trip and entries can't drift apart on tab close.
 */

const STORAGE_KEY = 'os.expiringFlags';

interface Entry {
  /** Arbitrary JSON-serialisable value. */
  v: unknown;
  /** Expiry, ms since epoch. */
  e: number;
}

type Store = Record<string, Entry>;

function read(): Store {
  if (typeof localStorage === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Store;
  } catch {
    // Corrupt blob; reset.
  }
  return {};
}

function write(store: Store): void {
  if (typeof localStorage === 'undefined') return;
  if (Object.keys(store).length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

function toMs(expiresAt: Date | number): number {
  return typeof expiresAt === 'number' ? expiresAt : expiresAt.getTime();
}

export const expiringFlags = {
  /**
   * Returns the stored value for `key`, or `null` if the entry is missing or
   * has expired. Expired entries are NOT pruned here (see {@link clearExpired}).
   */
  get<T = unknown>(key: string): T | null {
    const entry = read()[key];
    if (!entry) return null;
    if (Date.now() >= entry.e) return null;
    return entry.v as T;
  },

  /** Stores `value` under `key` until `expiresAt`. */
  set(key: string, value: unknown, expiresAt: Date | number): void {
    const store = read();
    store[key] = { v: value, e: toMs(expiresAt) };
    write(store);
  },

  /** Removes `key`, regardless of expiry. */
  delete(key: string): void {
    const store = read();
    if (!(key in store)) return;
    delete store[key];
    write(store);
  },

  /** Drops every entry whose expiry has passed. Call once on client startup. */
  clearExpired(): void {
    const store = read();
    const now = Date.now();
    let changed = false;
    for (const k of Object.keys(store)) {
      if (now >= store[k].e) {
        delete store[k];
        changed = true;
      }
    }
    if (changed) write(store);
  },
};
