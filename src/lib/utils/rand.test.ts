import { describe, it, expect } from 'vitest'
import { randStr } from './rand'

const ALLOWED_REGEX = /^[A-Za-z0-9]*$/

describe('randStr', () => {
  it('returns a string of the specified length', () => {
    const lengths = [0, 1, 5, 16, 64]
    for (const len of lengths) {
      const s = randStr(len)
      expect(s).toHaveLength(len)
    }
  })

  it('returns only characters from [A–Z][a–z][0–9]', () => {
    for (let i = 0; i < 10; i++) {
      const s = randStr(200)
      expect(s).toMatch(ALLOWED_REGEX)
    }
  })

  it('returns different strings on subsequent calls with the same length', () => {
    const len = 12
    const a = randStr(len)
    const b = randStr(len)
    // Very unlikely to collide twice in a row
    expect(a).not.toBe(b)
  })

  it('returns empty string for zero and negative lengths', () => {
    expect(randStr(0)).toBe('')
    // Negative length will not enter the loop, so it should also be ''
    expect(randStr(-5)).toBe('')
  })
})
