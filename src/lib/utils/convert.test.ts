import { describe, it, expect } from 'vitest'
import { NumberToHexPadded, u8arrToBinstr, binstrToU8arr } from './convert'

describe('NumberToHexPadded', () => {
  it('converts zero correctly with exact pad', () => {
    expect(NumberToHexPadded(0, 4)).toBe('0000')
  })

  it('converts small numbers and pads correctly', () => {
    expect(NumberToHexPadded(15, 2)).toBe('0F')       // 15 → "f" → padStart(2) → "0f" → uppercase
    expect(NumberToHexPadded(15, 4)).toBe('000F')     // pad to length 4
    expect(NumberToHexPadded(255, 2)).toBe('FF')      // 255 → "ff" → no extra padding
    expect(NumberToHexPadded(255, 1)).toBe('FF')      // pad < hex length, still returns full length
  })

  it('handles larger numbers and uppercase enforcement', () => {
    expect(NumberToHexPadded(4095, 3)).toBe('FFF')    // 4095 → "fff"
    expect(NumberToHexPadded(4095, 5)).toBe('00FFF')  // pad to length 5
  })

  it('treats negative inputs as unsigned 32-bit', () => {
    // -1 >>> 0 → 0xFFFFFFFF
    expect(NumberToHexPadded(-1, 8)).toBe('FFFFFFFF')
    expect(NumberToHexPadded(-2, 8)).toBe('FFFFFFFE')
  })

  it('handles maximum unsigned 32-bit value correctly', () => {
    const maxUint32 = 0xFFFFFFFF
    expect(NumberToHexPadded(maxUint32, 8)).toBe('FFFFFFFF')
    expect(NumberToHexPadded(maxUint32, 4)).toBe('FFFFFFFF') // pad < length, still full
  })
})

describe('u8arrToBinstr', () => {
  it('converts a simple ASCII Uint8Array to string', () => {
    const arr = new Uint8Array([65, 66, 67]) // "A", "B", "C"
    expect(u8arrToBinstr(arr)).toBe('ABC')
  })

  it('converts extended Latin1 values correctly', () => {
    const arr = new Uint8Array([0xC3, 0xA9, 0xFF]) // 195, 169, 255
    const result = u8arrToBinstr(arr)
    // charCodeAt should match the original bytes when decoded as Latin1
    expect(result.charCodeAt(0)).toBe(0xC3)
    expect(result.charCodeAt(1)).toBe(0xA9)
    expect(result.charCodeAt(2)).toBe(0xFF)
  })

  it('returns an empty string for an empty Uint8Array', () => {
    expect(u8arrToBinstr(new Uint8Array([]))).toBe('')
  })
})

describe('binstrToU8arr', () => {
  it('converts a simple ASCII string to Uint8Array', () => {
    const s = 'ABC'
    const arr = binstrToU8arr(s)
    expect(arr).toBeInstanceOf(Uint8Array)
    expect(Array.from(arr)).toEqual([65, 66, 67])
  })

  it('converts extended characters to proper byte values', () => {
    const s = String.fromCharCode(195, 169, 255) // Latin1 chars
    const arr = binstrToU8arr(s)
    expect(Array.from(arr)).toEqual([195, 169, 255])
  })

  it('returns an empty Uint8Array for an empty string', () => {
    const arr = binstrToU8arr('')
    expect(arr).toBeInstanceOf(Uint8Array)
    expect(arr.length).toBe(0)
  })
})

describe('round-trip between u8arrToBinstr and binstrToU8arr', () => {
  it('returns the original string after converting to Uint8Array and back', () => {
    const original = 'Test\u00FF\u00A0' // includes extended Latin1 chars
    const asBytes = binstrToU8arr(original)
    const backToString = u8arrToBinstr(asBytes)
    expect(backToString).toBe(original)
  })

  it('returns the original Uint8Array after converting to string and back', () => {
    const originalArr = new Uint8Array([0, 127, 128, 255])
    const asString = u8arrToBinstr(originalArr)
    const backToArr = binstrToU8arr(asString)
    expect(Array.from(backToArr)).toEqual(Array.from(originalArr))
  })
})
