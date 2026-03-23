import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePet } from './usePet'
import { getPetById, updatePet, deletePet } from '@/services/pets-service'
import type { Pet } from '@/types/pet'

vi.mock('@/services/pets-service')

const mockPet: Pet = {
  id: 'pet-1',
  user_id: 'user-1',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
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
  vi.clearAllMocks()
})

describe('usePet', () => {
  it('loads pet on mount', async () => {
    vi.mocked(getPetById).mockResolvedValue(mockPet)

    const { result } = renderHook(() => usePet('pet-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.pet).toEqual(mockPet)
    expect(result.current.error).toBeNull()
  })

  it('sets error when pet is not found', async () => {
    vi.mocked(getPetById).mockResolvedValue(null)

    const { result } = renderHook(() => usePet('pet-999'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.pet).toBeNull()
    expect(result.current.error).toBe('Pet not found')
  })

  it('sets error on service failure', async () => {
    vi.mocked(getPetById).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePet('pet-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Network error')
  })

  it('update calls updatePet service and sets new pet', async () => {
    vi.mocked(getPetById).mockResolvedValue(mockPet)
    const updated = { ...mockPet, name: 'Buddy Jr.' }
    vi.mocked(updatePet).mockResolvedValue(updated)

    const { result } = renderHook(() => usePet('pet-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.update({ name: 'Buddy Jr.' })
    })

    expect(result.current.pet?.name).toBe('Buddy Jr.')
  })

  it('remove calls deletePet service', async () => {
    vi.mocked(getPetById).mockResolvedValue(mockPet)
    vi.mocked(deletePet).mockResolvedValue()

    const { result } = renderHook(() => usePet('pet-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.remove()
    })

    expect(deletePet).toHaveBeenCalledWith('pet-1')
  })
})
