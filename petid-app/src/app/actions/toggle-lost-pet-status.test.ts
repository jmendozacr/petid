import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Pet } from '@/types/pet'

const mockGetUser = vi.fn()
const mockFromSelect = vi.fn()
const mockRevalidatePath = vi.fn()
const mockToggleLostStatus = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockFromSelect,
        }),
      }),
    }),
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/services/pets-service', () => ({
  toggleLostStatus: mockToggleLostStatus,
}))

const mockPet: Pet = {
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
  is_lost: true,
  lost_since: '2024-06-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('toggleLostPetStatus', () => {
  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockToggleLostStatus).not.toHaveBeenCalled()
  })

  it('returns error when pet is not found', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockFromSelect.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'Pet not found' })
    expect(mockToggleLostStatus).not.toHaveBeenCalled()
  })

  it('returns error when pet belongs to a different user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-2' } } })
    mockFromSelect.mockResolvedValueOnce({ data: { user_id: 'user-1' }, error: null })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockToggleLostStatus).not.toHaveBeenCalled()
  })

  it('returns updated pet on success and calls revalidatePath', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockFromSelect.mockResolvedValueOnce({ data: { user_id: 'user-1' }, error: null })
    mockToggleLostStatus.mockResolvedValueOnce(mockPet)

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: true, pet: mockPet })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/p/pet-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/pets/pet-1')
  })

  it('does not call revalidatePath on service error', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockFromSelect.mockResolvedValueOnce({ data: { user_id: 'user-1' }, error: null })
    mockToggleLostStatus.mockRejectedValueOnce(new Error('DB failure'))

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'DB failure' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
