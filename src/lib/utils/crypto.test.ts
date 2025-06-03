import { describe, it, expect } from 'vitest'
import { ArrayBufferToHex, HashBuffer, HashString } from './crypto'
import { EncodeString } from './encoding'

describe('ArrayBufferToHex', () => {
  it('converts an ArrayBuffer to a lowercase hex string', () => {
    const bytes = new Uint8Array([0x00, 0x0f, 0xff]).buffer
    expect(ArrayBufferToHex(bytes)).toBe('000fff')
  })

  it('handles an empty ArrayBuffer', () => {
    const empty = new Uint8Array([]).buffer
    expect(ArrayBufferToHex(empty)).toBe('')
  })

  it('pads single-digit hex values with a leading zero', () => {
    const bytes = new Uint8Array([0x5, 0xa, 0x10]).buffer
    // 0x05 → "05", 0x0a → "0a", 0x10 → "10"
    expect(ArrayBufferToHex(bytes)).toBe('050a10')
  })
})

describe('HashBuffer', () => {
  it('computes SHA-1 of a known UTF-8 byte sequence', async () => {
    const data = new TextEncoder().encode('abc')
    const hash = await HashBuffer(data, 'SHA-1')
    // SHA-1("abc") = a9993e364706816aba3e25717850c26c9cd0d89d
    expect(hash).toBe('a9993e364706816aba3e25717850c26c9cd0d89d')
  })

  it('computes SHA-256 of the same UTF-8 byte sequence', async () => {
    const data = new TextEncoder().encode('abc')
    const hash = await HashBuffer(data, 'SHA-256')
    // SHA-256("abc") =
    // ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
    expect(hash).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })

  it('can hash arbitrary byte sequences, not only text', async () => {
    const raw = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
    const sha1Hash = await HashBuffer(raw, 'SHA-1')
    // Precomputed SHA-1 of [0xde,0xad,0xbe,0xef]:
    // "d78f8bb992a56a597f6c7a1fb918bb78271367eb"
    expect(sha1Hash).toBe('d78f8bb992a56a597f6c7a1fb918bb78271367eb')

    const sha256Hash = await HashBuffer(raw, 'SHA-256')
    // Precomputed SHA-256 of [0xde,0xad,0xbe,0xef]:
    // "5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953"
    expect(sha256Hash).toBe(
      '5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953'
    )
  })
})

describe('HashString', () => {
  it('delegates to HashBuffer via EncodeString and computes SHA-1', async () => {
    // Ensure EncodeString is actually converting "hello" to the correct Uint8Array
    const manualBuffer = new TextEncoder().encode('hello')
    const expectedHex = await HashBuffer(manualBuffer, 'SHA-1')
    const hashFromString = await HashString('hello', 'SHA-1')
    expect(hashFromString).toBe(expectedHex)
  })

  it('computes SHA-256 for a longer phrase', async () => {
    const phrase = 'The quick brown fox jumps over the lazy dog'
    // Known SHA-256 of that phrase:
    // d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592
    const hash = await HashString(phrase, 'SHA-256')
    expect(hash).toBe(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
    )
  })

  it('returns the same result as HashBuffer when using EncodeString internally', async () => {
    const input = 'Vitest'
    const bufferFromEncode = EncodeString(input)
    const buffHash = await HashBuffer(bufferFromEncode, 'SHA-256')
    const strHash = await HashString(input, 'SHA-256')
    expect(strHash).toBe(buffHash)
  })
})
