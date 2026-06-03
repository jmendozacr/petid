import { describe, it, expect } from 'vitest'
import { calculatePetAge } from './pet-age'

const NOW = new Date('2026-06-02')

describe('calculatePetAge', () => {
  it('returns null when birthdate is null', () => {
    expect(calculatePetAge(null, NOW)).toBeNull()
  })

  it('returns correct years and months for a 2y 3m old pet', () => {
    expect(calculatePetAge('2024-03-01', NOW)).toEqual({ years: 2, months: 3 })
  })

  it('returns null for a future birthdate', () => {
    expect(calculatePetAge('2028-01-01', NOW)).toBeNull()
  })

  it('returns { years: 2, months: 0 } when birthday is exactly today', () => {
    expect(calculatePetAge('2024-06-02', NOW)).toEqual({ years: 2, months: 0 })
  })

  it('does not count the current month when day has not yet passed (boundary day)', () => {
    // born June 15 — the 2nd of June has not yet reached the 15th → 1y 11m
    expect(calculatePetAge('2024-06-15', NOW)).toEqual({ years: 1, months: 11 })
  })

  it('returns { years: 0, months: 0 } for a pet younger than one month', () => {
    // born May 15, now June 2 — day 2 < day 15 → 0 months
    expect(calculatePetAge('2026-05-15', NOW)).toEqual({ years: 0, months: 0 })
  })
})
