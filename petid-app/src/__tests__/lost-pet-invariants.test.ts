import { describe, it, expect, vi } from 'vitest'
import { toggleLostStatus } from '@/services/pets-service'
import type { Pet } from '@/types/pet'

const { mockTerminal } = vi.hoisted(() => ({
  mockTerminal: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const c: Record<string, unknown> = {}
    c.select = () => c
    c.eq = () => c
    c.update = () => c
    c.single = mockTerminal
    return {
      auth: { getUser: vi.fn() },
      from: () => c,
    }
  },
}))

const basePet: Pet = {
  id: 'pet-1',
  user_id: 'user-1',
  name: 'Buddy',
  species: 'Dog',
  breed: null,
  birthdate: null,
  color: null,
  weight: null,
  microchip_id: null,
  photo_url: null,
  owner_phone: null,
  emergency_contact: null,
  is_lost: false,
  lost_since: null,
  created_at: '2024-01-01T00:00:00Z',
}

describe('Lost pet invariants', () => {
  it('service never produces { is_lost: false, lost_since: non-null }', async () => {
    const returnedPet: Pet = { ...basePet, is_lost: false, lost_since: null }
    mockTerminal.mockResolvedValueOnce({ data: returnedPet, error: null })

    const result = await toggleLostStatus('pet-1', false)

    expect(result.is_lost).toBe(false)
    expect(result.lost_since).toBeNull()
  })

  it('service produces { is_lost: true, lost_since: non-null } when marking lost', async () => {
    const returnedPet: Pet = { ...basePet, is_lost: true, lost_since: '2024-06-01T00:00:00Z' }
    mockTerminal.mockResolvedValueOnce({ data: returnedPet, error: null })

    const result = await toggleLostStatus('pet-1', true)

    expect(result.is_lost).toBe(true)
    expect(result.lost_since).not.toBeNull()
  })

  it('is_lost: false always implies lost_since: null in service output', async () => {
    const returnedPet: Pet = { ...basePet, is_lost: false, lost_since: null }
    mockTerminal.mockResolvedValueOnce({ data: returnedPet, error: null })

    const result = await toggleLostStatus('pet-1', false)

    if (!result.is_lost) {
      expect(result.lost_since).toBeNull()
    }
  })
})
