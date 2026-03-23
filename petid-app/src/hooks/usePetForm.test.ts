import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePetForm } from './usePetForm'
import { createPet } from '@/services/pets-service'
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
  vi.clearAllMocks()
})

describe('usePetForm', () => {
  it('initializes with empty form data', () => {
    const { result } = renderHook(() => usePetForm())

    expect(result.current.formData.name).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handleChange updates the correct field', () => {
    const { result } = renderHook(() => usePetForm())

    act(() => {
      result.current.handleChange('name', 'Buddy')
    })

    expect(result.current.formData.name).toBe('Buddy')
  })

  it('submit with empty name sets error and returns null', async () => {
    const { result } = renderHook(() => usePetForm())

    let returned: Pet | null = mockPet
    await act(async () => {
      returned = await result.current.submit()
    })

    expect(returned).toBeNull()
    expect(result.current.error).toBe('El nombre de la mascota es requerido')
    expect(createPet).not.toHaveBeenCalled()
  })

  it('submit with valid name calls createPet and returns pet', async () => {
    vi.mocked(createPet).mockResolvedValue(mockPet)

    const { result } = renderHook(() => usePetForm())

    act(() => { result.current.handleChange('name', 'Buddy') })

    let returned: Pet | null = null
    await act(async () => {
      returned = await result.current.submit()
    })

    expect(returned).toEqual(mockPet)
    expect(result.current.error).toBeNull()
  })

  it('submit on service error sets error and returns null', async () => {
    vi.mocked(createPet).mockRejectedValue(new Error('Failed to create pet'))

    const { result } = renderHook(() => usePetForm())
    act(() => { result.current.handleChange('name', 'Buddy') })

    let returned: Pet | null = mockPet
    await act(async () => {
      returned = await result.current.submit()
    })

    expect(returned).toBeNull()
    expect(result.current.error).toBe('Failed to create pet')
  })

  it('reset clears form data and error', async () => {
    vi.mocked(createPet).mockRejectedValue(new Error('Error'))

    const { result } = renderHook(() => usePetForm())
    act(() => { result.current.handleChange('name', 'Buddy') })
    await act(async () => { await result.current.submit() })

    act(() => { result.current.reset() })

    expect(result.current.formData.name).toBe('')
    expect(result.current.error).toBeNull()
  })
})
