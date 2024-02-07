export function calculateStringEntropy(value: string): number {
  const uniqueChars = new Set(value);
  const length = value.length;
  const uniqueLength = uniqueChars.size;

  return Math.log2(Math.pow(uniqueLength, length));
}
