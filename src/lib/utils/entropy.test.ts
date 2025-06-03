import { describe, it, expect } from 'vitest'
import { calculateStringEntropy } from './entropy'

describe('calculateStringEntropy', () => {
  it('returns 0 for an empty string', () => {
    // uniqueLength = 0, length = 0 => Math.pow(0, 0) = 1 => log2(1) = 0
    expect(calculateStringEntropy('')).toBe(0)
  })

  it('returns 0 when all characters are the same', () => {
    // e.g., "aaaa", uniqueLength = 1, length = 4 => 1^4 = 1 => log2(1) = 0
    expect(calculateStringEntropy('aaaa')).toBe(0)
    expect(calculateStringEntropy('bbbbbbbb')).toBe(0)
  })

  it('computes correctly for two unique characters', () => {
    // "01", uniqueLength = 2, length = 2 => 2^2 = 4 => log2(4) = 2
    expect(calculateStringEntropy('01')).toBe(2)

    // "abab", uniqueLength = 2, length = 4 => 2^4 = 16 => log2(16) = 4
    expect(calculateStringEntropy('abab')).toBe(4)
  })

  it('computes correctly when all characters are unique', () => {
    // "abcd", uniqueLength = 4, length = 4 => 4^4 = 256 => log2(256) = 8
    expect(calculateStringEntropy('abcd')).toBe(8)

    // "xyz", uniqueLength = 3, length = 3 => 3^3 = 27 => log2(27) = 3 * log2(3)
    const expected = 3 * Math.log2(3)
    expect(calculateStringEntropy('xyz')).toBeCloseTo(expected)
  })

  it('is order‐invariant: same set of characters yields same entropy regardless of ordering', () => {
    const s1 = 'abcabc'
    const s2 = 'cbaacb'
    // Both: uniqueLength = 3, length = 6 => 3^6 => log2(3^6) = 6 * log2(3)
    const expected = 6 * Math.log2(3)
    expect(calculateStringEntropy(s1)).toBeCloseTo(expected)
    expect(calculateStringEntropy(s2)).toBeCloseTo(expected)
  })

  it('handles longer mixed strings', () => {
    const value = 'abcabcabc' // uniqueLength = 3, length = 9
    // 3^9 = 19683, log2(19683) = 9 * log2(3)
    const expected = 9 * Math.log2(3)
    expect(calculateStringEntropy(value)).toBeCloseTo(expected)

    const mixed = 'AaBbCc123!@#'
    // uniqueLength = number of distinct chars in mixed
    const uniqueLength = new Set(mixed).size
    const length = mixed.length
    const total = Math.pow(uniqueLength, length)
    const expectedMixed = Math.log2(total)
    expect(calculateStringEntropy(mixed)).toBeCloseTo(expectedMixed)
  })
})
