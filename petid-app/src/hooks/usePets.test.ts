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
  is_lost: false,
  lost_since: null,
  lost_lat: null,
  lost_lng: null,
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  usePetStore.setState({ pets: [], isLoading: false, error: null })
  vi.clearAllMocks()
})

describe('usePets', () => {
  it('loads pets on mount', async () => {
    vi.mocked(getPets).mockResolvedValue([mockPet])

    const { result } = renderHook(() => usePets())

    await act(async () => {})

    expect(result.current.pets).toEqual([mockPet])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets error when fetch fails', async () => {
    vi.mocked(getPets).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePets())

    await act(async () => {})

    expect(result.current.error).toBe('Network error')
    expect(result.current.pets).toEqual([])
  })

  it('clearError resets error state', async () => {
    vi.mocked(getPets).mockRejectedValue(new Error('Some error'))

    const { result } = renderHook(() => usePets())

    await act(async () => {})

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('sets fallback error when thrown value is not an Error instance', async () => {
    vi.mocked(getPets).mockRejectedValue('plain string error')

    const { result } = renderHook(() => usePets())

    await act(async () => {})

    expect(result.current.error).toBe('Failed to load pets')
  })

  it('does not update state after unmount (cancelled fetch)', async () => {
    let resolvePets: (pets: Pet[]) => void
    vi.mocked(getPets).mockReturnValue(new Promise(res => { resolvePets = res }))

    const { unmount } = renderHook(() => usePets())

    unmount()

    await act(async () => { resolvePets([]) })
  })

  it('does not update error state after unmount (cancelled failed fetch)', async () => {
    let rejectPets: (err: Error) => void
    vi.mocked(getPets).mockReturnValue(new Promise((_, rej) => { rejectPets = rej }))

    const { unmount } = renderHook(() => usePets())

    unmount()

    await act(async () => { rejectPets(new Error('Network')) })
  })
})
