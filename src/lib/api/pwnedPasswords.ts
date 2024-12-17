import SHA1 from 'crypto-js/sha1';

export async function checkPwnedCount(password: string): Promise<number> {
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  const hash = SHA1(password).toString();
  const hashPrefix = hash.substring(0, 5);
  const hashSuffix = hash.substring(5).toUpperCase();

  let raw: string;
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);

    raw = await response.text();
  } catch {
    throw new Error('Error while fetching pwned passwords range');
  }

  const match = raw.split('\n').find((line) => line.startsWith(hashSuffix));

  if (match) {
    const [, count] = match.split(':');

    return parseInt(count);
  }

  return 0;
}
