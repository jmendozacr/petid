import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePets } from './usePets'
import { getPets } from '@/services/pets-service'
import { usePetStore } from '@/stores/pet-store'
import type { Pet } from '@/types/pet'

vi.mock('@/services/pets-service')

const mockPet: Pet = {
  id: '1',
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
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  usePetStore.setState({ pets: [], isLoading: false, error: null, selectedPet: null })
  vi.clearAllMocks()
})

describe('usePets', () => {
  it('loadPets sets pets in store on success', async () => {
    vi.mocked(getPets).mockResolvedValue([mockPet])

    const { result } = renderHook(() => usePets())

    await act(async () => {
      await result.current.loadPets()
    })

    expect(result.current.pets).toEqual([mockPet])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('loadPets sets error on failure', async () => {
    vi.mocked(getPets).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePets())

    await act(async () => {
      await result.current.loadPets()
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.pets).toEqual([])
  })

  it('clearError resets error state', async () => {
    vi.mocked(getPets).mockRejectedValue(new Error('Some error'))

    const { result } = renderHook(() => usePets())

    await act(async () => {
      await result.current.loadPets()
    })

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })
})
