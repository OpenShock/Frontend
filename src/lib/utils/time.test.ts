import { describe, it, expect } from 'vitest'
import { durationToString, elapsedToString } from './time'

const MS_IN_SECOND = 1000
const MS_IN_MINUTE = 60 * MS_IN_SECOND
const MS_IN_HOUR = 60 * MS_IN_MINUTE
const MS_IN_DAY = 24 * MS_IN_HOUR
const MS_IN_MONTH = 30 * MS_IN_DAY
const MS_IN_YEAR = 365 * MS_IN_DAY

describe('durationToString', () => {
  it('returns seconds when duration is less than one minute, with correct singular/plural', () => {
    expect(durationToString(0)).toBe('0 seconds')
    expect(durationToString(MS_IN_SECOND - 1)).toBe('0 seconds')       // 999 ms → 0 s
    expect(durationToString(MS_IN_SECOND)).toBe('1 second')
    expect(durationToString(2.5 * MS_IN_SECOND)).toBe('2 seconds')    // 2 500 ms → 2 s
    expect(durationToString(59 * MS_IN_SECOND)).toBe('59 seconds')
  })

  it('returns minutes when duration is between one minute and one hour', () => {
    expect(durationToString(MS_IN_MINUTE)).toBe('1 minute')
    expect(durationToString(2 * MS_IN_MINUTE - 1)).toBe('1 minute')   // 119 999 ms → 1.999 min → floor → 1
    expect(durationToString(2 * MS_IN_MINUTE)).toBe('2 minutes')
    expect(durationToString(MS_IN_HOUR - 1)).toBe('59 minutes')       // 3 599 999 ms → 59.9999 min → floor → 59
  })

  it('returns hours when duration is between one hour and one day', () => {
    expect(durationToString(MS_IN_HOUR)).toBe('1 hour')
    expect(durationToString(1.5 * MS_IN_HOUR)).toBe('1 hour')         // 5 400 000 ms → 1.5 h → floor → 1
    expect(durationToString(2 * MS_IN_HOUR)).toBe('2 hours')
    expect(durationToString(MS_IN_DAY - 1)).toBe('23 hours')          // 86 399 999 ms → 23.999 h → floor → 23
  })

  it('returns days when duration is between one day and one month', () => {
    expect(durationToString(MS_IN_DAY)).toBe('1 day')
    expect(durationToString(2 * MS_IN_DAY)).toBe('2 days')
    expect(durationToString(2.5 * MS_IN_DAY)).toBe('2 days')          // 216 000 000 ms → 2.5 d → floor → 2
    expect(durationToString(MS_IN_MONTH - 1)).toBe('29 days')         // 2 591 999 999 ms → 29.999 d → floor → 29
  })

  it('returns months when duration is between one month and one year', () => {
    expect(durationToString(MS_IN_MONTH)).toBe('1 month')
    expect(durationToString(2 * MS_IN_MONTH)).toBe('2 months')
    expect(durationToString(45 * MS_IN_DAY)).toBe('1 month')          // 45 d → 1.5 mo → floor → 1
    expect(durationToString(MS_IN_YEAR - 1)).toBe('12 months')        // ~12.16 mo → floor → 12
  })

  it('returns years when duration is one year or more', () => {
    expect(durationToString(MS_IN_YEAR)).toBe('1 year')
    expect(durationToString(2 * MS_IN_YEAR)).toBe('2 years')
    expect(durationToString(1.5 * MS_IN_YEAR)).toBe('1 year')         // 1.5 y → floor → 1
    expect(durationToString(100_000_000_000)).toBe('3 years')         // ~3.17 y → floor → 3
  })

  it('treats negative inputs as positive when computing unit', () => {
    expect(durationToString(-MS_IN_SECOND)).toBe('1 second')
    expect(durationToString(-MS_IN_MINUTE)).toBe('1 minute')
    expect(durationToString(-MS_IN_HOUR)).toBe('1 hour')
  })
})

describe('elapsedToString', () => {
  it('prefixes "in " when duration is non-negative', () => {
    expect(elapsedToString(0)).toBe('in 0 seconds')
    expect(elapsedToString(2 * MS_IN_SECOND)).toBe('in 2 seconds')
    expect(elapsedToString(MS_IN_MINUTE)).toBe('in 1 minute')
    expect(elapsedToString(2 * MS_IN_HOUR)).toBe('in 2 hours')
  })

  it('suffixes " ago" when duration is negative', () => {
    expect(elapsedToString(-MS_IN_SECOND)).toBe('1 second ago')
    expect(elapsedToString(-MS_IN_MINUTE)).toBe('1 minute ago')
    expect(elapsedToString(-MS_IN_HOUR)).toBe('1 hour ago')
    expect(elapsedToString(-2 * MS_IN_HOUR)).toBe('2 hours ago')
  })
})
