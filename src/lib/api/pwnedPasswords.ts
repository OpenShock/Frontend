import { HashString } from "$lib/utils/crypto";

export async function checkPwnedCount(password: string): Promise<number> {
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  const hash = await HashString(password, 'SHA-1');
  const hashPrefix = hash.substring(0, 5);

  let raw: string;
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);

    raw = await response.text();
  } catch {
    throw new Error('Error while fetching pwned passwords range');
  }

  const hashSuffix = hash.substring(5).toUpperCase();
  const match = raw.split('\n').find((line) => line.startsWith(hashSuffix));

  if (match) {
    const [, count] = match.split(':');

    return parseInt(count);
  }

  return 0;
}
