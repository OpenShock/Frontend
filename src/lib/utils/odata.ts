/**
 * Helpers for building the OData-style `$filter` strings our admin listing endpoints accept
 * (e.g. `status eq 'failed'`, `recipient ilike '%@example.com'`).
 *
 * String literals are always wrapped in single quotes; embedded quotes/backslashes are escaped.
 * Prefer these over hand-concatenating filter fragments so quoting/escaping lives in one place.
 */

/** Wrap a value in single quotes and escape embedded quotes/backslashes. */
export function odataLiteral(value: string): string {
  return `'${value.replace(/(['\\])/g, '\\$1')}'`;
}

/** `field eq 'value'` — exact match. */
export function odataEq(field: string, value: string): string {
  return `${field} eq ${odataLiteral(value)}`;
}

/** `field ilike 'pattern'` — case-insensitive match against a raw pattern (caller supplies `%`). */
export function odataILike(field: string, pattern: string): string {
  return `${field} ilike ${odataLiteral(pattern)}`;
}

/** `field ilike '%value%'` — case-insensitive substring search. */
export function odataContains(field: string, value: string): string {
  return odataILike(field, `%${value}%`);
}

/**
 * Join clauses with `and`, dropping empty/`undefined` ones. Returns `undefined` when nothing
 * is left, so it can be handed straight to a `$filter` query param.
 */
export function odataAnd(...clauses: (string | null | undefined | false)[]): string | undefined {
  const present = clauses.filter((c): c is string => Boolean(c));
  return present.length > 0 ? present.join(' and ') : undefined;
}
