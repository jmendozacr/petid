import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLostPetToggle } from './useLostPetToggle'
import type { Pet } from '@/types/pet'

const { mockToggleLostPetStatus } = vi.hoisted(() => ({
  mockToggleLostPetStatus: vi.fn(),
}))

vi.mock('@/app/actions/toggle-lost-pet-status', () => ({
  toggleLostPetStatus: mockToggleLostPetStatus,
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

describe('useLostPetToggle', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets isLoading to true during the call', async () => {
    let resolveAction!: (val: { success: boolean; pet: Pet }) => void
    mockToggleLostPetStatus.mockReturnValueOnce(
      new Promise((res) => { resolveAction = res })
    )

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    act(() => {
      result.current.toggle(true)
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveAction({ success: true, pet: mockPet })
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('returns the pet on success', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({ success: true, pet: mockPet })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    let returnedPet: Pet | null = null
    await act(async () => {
      returnedPet = await result.current.toggle(true)
    })

    expect(returnedPet).toEqual(mockPet)
    expect(result.current.error).toBeNull()
  })

  it('sets error and returns null on failure', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({ success: false, error: 'Unauthorized' })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    let returnedPet: Pet | null = mockPet
    await act(async () => {
      returnedPet = await result.current.toggle(true)
    })

    expect(returnedPet).toBeNull()
    expect(result.current.error).toBe('Unauthorized')
  })

  it('clearError resets error to null', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({ success: false, error: 'Unauthorized' })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    await act(async () => {
      await result.current.toggle(true)
    })

    expect(result.current.error).toBe('Unauthorized')

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })
})
