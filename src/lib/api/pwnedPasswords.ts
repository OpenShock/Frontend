import { sha1 } from "js-sha1";

export async function fetchPasswordsRangeRaw(hashPrefix: string): Promise<string> {
  const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);

  if (!response.ok) {
    throw new Error('Failed to fetch pwned passwords range');
  }

  return await response.text();
}


export async function fetchPasswordsRange(hashPrefix: string): Promise<{ hash: string; count: number }[]> {
  const raw = await fetchPasswordsRangeRaw(hashPrefix);

  return raw
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => {
      const [hash, count] = line.trim().split(':');
      return { hash, count: parseInt(count) };
    });
}

export async function checkPwnedCount(password: string): Promise<number> {
  const hash = sha1(password).toUpperCase();
  const hashPrefix = hash.substring(0, 5);
  const hashSuffix = hash.substring(5);

  const range = await fetchPasswordsRange(hashPrefix);

  const match = range.find((hash) => hash.hash == hashSuffix);

  return match?.count || 0;
}
