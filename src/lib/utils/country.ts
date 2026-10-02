const regionNames = new Intl.DisplayNames(undefined, { type: 'region', fallback: 'code' });

/**
 * Human-readable name for a two-letter region code, or null when the code
 * carries no location.
 *
 * Cloudflare's CF-IPCountry uses `XX` for unknown and `T1` for Tor.
 */
export function countryName(code: string | null): string | null {
  switch (code) {
    case null:
    case '':
    case 'XX':
      return null;
    case 'T1':
      return 'Tor';
  }
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}
