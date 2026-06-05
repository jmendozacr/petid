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
  lost_lat: null,
  lost_lng: null,
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

  // REQ-10.1: foundReport exposed after successful toggle(false) with report
  it('exposes foundReport after successful mark-as-found with a report (REQ-10.1)', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({
      success: true,
      pet: mockPet,
      foundReport: { contact: 'finder@example.com', message: 'Near the park' },
    })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    expect(result.current.foundReport).toBeNull()

    await act(async () => {
      await result.current.toggle(false)
    })

    expect(result.current.foundReport).toEqual({
      contact: 'finder@example.com',
      message: 'Near the park',
    })
  })

  // REQ-10.1 variant: foundReport is null when action returns no report
  it('foundReport remains null when mark-as-found has no report', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({
      success: true,
      pet: mockPet,
      foundReport: undefined,
    })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    await act(async () => {
      await result.current.toggle(false)
    })

    expect(result.current.foundReport).toBeNull()
  })

  // REQ-10.2: failed toggle → foundReport not exposed
  it('does not expose stale foundReport after failed toggle (REQ-10.2)', async () => {
    // First call succeeds with a report
    mockToggleLostPetStatus.mockResolvedValueOnce({
      success: true,
      pet: mockPet,
      foundReport: { contact: 'finder@example.com', message: null },
    })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    await act(async () => {
      await result.current.toggle(false)
    })

    expect(result.current.foundReport).not.toBeNull()

    // Second call fails → foundReport must be cleared
    mockToggleLostPetStatus.mockResolvedValueOnce({ success: false, error: 'Unauthorized' })

    await act(async () => {
      await result.current.toggle(false)
    })

    expect(result.current.foundReport).toBeNull()
  })

  it('sets fallback error message when result has no error field (line 28 ?? branch)', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({ success: false })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    await act(async () => { await result.current.toggle(true) })

    expect(result.current.error).toBe('Unknown error')
  })

  it('returns null when successful result has no pet field (line 36 ?? branch)', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    let returnedPet: ReturnType<typeof result.current.toggle> | null = null
    await act(async () => { returnedPet = await result.current.toggle(false) })

    expect(await returnedPet).toBeNull()
  })

  // foundReport cleared at the start of each toggle call
  it('clears foundReport at the start of a new toggle call', async () => {
    mockToggleLostPetStatus.mockResolvedValueOnce({
      success: true,
      pet: mockPet,
      foundReport: { contact: 'finder@example.com', message: null },
    })

    const { result } = renderHook(() => useLostPetToggle('pet-1'))

    await act(async () => {
      await result.current.toggle(false)
    })

    expect(result.current.foundReport).not.toBeNull()

    // Start a new toggle that resolves with no report
    mockToggleLostPetStatus.mockResolvedValueOnce({
      success: true,
      pet: mockPet,
      foundReport: undefined,
    })

    await act(async () => {
      await result.current.toggle(false)
    })

    expect(result.current.foundReport).toBeNull()
  })
})
