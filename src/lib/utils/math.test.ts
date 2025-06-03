import { describe, it, expect } from 'vitest'
import {
  DegToRad,
  RadToDeg,
  clamp,
  lerp,
  invLerp,
  getCircleX,
  getCircleY,
} from './math'

describe('math constants', () => {
  it('DegToRad ≈ π/180', () => {
    expect(DegToRad).toBeCloseTo(Math.PI / 180)
  })

  it('RadToDeg ≈ 180/π', () => {
    expect(RadToDeg).toBeCloseTo(180 / Math.PI)
  })

  it('DegToRad and RadToDeg are inverses', () => {
    expect(DegToRad * RadToDeg).toBeCloseTo(1)
  })
})

describe('clamp(value, min, max)', () => {
  it('returns min when value is below min', () => {
    expect(clamp(-10, 0, 5)).toBe(0)
  })

  it('returns max when value is above max', () => {
    expect(clamp(10, 0, 5)).toBe(5)
  })

  it('returns value when it is between min and max', () => {
    expect(clamp(3, 0, 5)).toBe(3)
    expect(clamp(0, 0, 5)).toBe(0)
    expect(clamp(5, 0, 5)).toBe(5)
  })

  it('works when min and max are negative or reversed', () => {
    expect(clamp(-3, -5, -1)).toBe(-3)
    expect(clamp(-6, -5, -1)).toBe(-5)
    expect(clamp(0, -5, -1)).toBe(-1)
  })
})

describe('lerp(a, b, t)', () => {
  it('returns a when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10)
  })

  it('returns b when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20)
  })

  it('returns midpoint when t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15)
  })

  it('interpolates correctly for t outside [0,1]', () => {
    expect(lerp(0, 100, 1.5)).toBe(150)
    expect(lerp(0, 100, -0.5)).toBe(-50)
  })
})

describe('invLerp(a, b, value)', () => {
  it('returns 0 when value equals a', () => {
    expect(invLerp(10, 20, 10)).toBeCloseTo(0)
  })

  it('returns 1 when value equals b', () => {
    expect(invLerp(10, 20, 20)).toBeCloseTo(1)
  })

  it('returns 0.5 when value is midpoint', () => {
    expect(invLerp(10, 20, 15)).toBeCloseTo(0.5)
  })

  it('returns negative t when value < a and >1 when value > b', () => {
    expect(invLerp(10, 20, 5)).toBeCloseTo(-0.5)
    expect(invLerp(10, 20, 25)).toBeCloseTo(1.5)
  })

  it('is inverse of lerp for linear inputs', () => {
    const a = -50
    const b = 150
    for (const t of [0, 0.2, 0.75, 1, 1.3]) {
      const interpolated = lerp(a, b, t)
      expect(invLerp(a, b, interpolated)).toBeCloseTo(t)
    }
  })
})

describe('getCircleX(radius, degrees) and getCircleY(radius, degrees)', () => {
  const radius = 10

  it('at 0° returns (radius, 0)', () => {
    expect(getCircleX(radius, 0)).toBeCloseTo(radius)
    expect(getCircleY(radius, 0)).toBeCloseTo(0)
  })

  it('at 90° returns (0, radius)', () => {
    expect(getCircleX(radius, 90)).toBeCloseTo(0)
    expect(getCircleY(radius, 90)).toBeCloseTo(radius)
  })

  it('at 180° returns (-radius, 0)', () => {
    expect(getCircleX(radius, 180)).toBeCloseTo(-radius)
    expect(getCircleY(radius, 180)).toBeCloseTo(0)
  })

  it('at 270° returns (0, -radius)', () => {
    expect(getCircleX(radius, 270)).toBeCloseTo(0)
    expect(getCircleY(radius, 270)).toBeCloseTo(-radius)
  })

  it('handles non-right angles correctly (e.g., 45°)', () => {
    const diag = radius / Math.sqrt(2)
    expect(getCircleX(radius, 45)).toBeCloseTo(diag)
    expect(getCircleY(radius, 45)).toBeCloseTo(diag)
  })

  it('works with negative and >360° angles by relying on cosine/sine periodicity', () => {
    expect(getCircleX(radius, -90)).toBeCloseTo(0)
    expect(getCircleY(radius, -90)).toBeCloseTo(-radius)
    expect(getCircleX(radius, 450)).toBeCloseTo(0)   // 450° = 360° + 90°
    expect(getCircleY(radius, 450)).toBeCloseTo(radius)
  })
})
