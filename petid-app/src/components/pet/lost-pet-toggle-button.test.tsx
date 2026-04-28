import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LostPetToggleButton } from './lost-pet-toggle-button'
import type { Pet } from '@/types/pet'

const { mockToggle, mockIsLoading, mockToast } = vi.hoisted(() => ({
  mockToggle: vi.fn(),
  mockIsLoading: { value: false },
  mockToast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/hooks/useLostPetToggle', () => ({
  useLostPetToggle: () => ({
    isLoading: mockIsLoading.value,
    toggle: mockToggle,
    error: null,
    clearError: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: mockToast.success,
    error: mockToast.error,
  },
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
  is_lost: false,
  lost_since: null,
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockIsLoading.value = false
})

describe('LostPetToggleButton', () => {
  it('renders "Mark as Lost" when pet is not lost', () => {
    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    expect(screen.getByRole('button', { name: 'Mark as Lost' })).toBeInTheDocument()
  })

  it('renders "Mark as Found" when pet is lost', () => {
    render(
      <LostPetToggleButton petId="pet-1" isLost={true} lostSince="2024-06-01T00:00:00Z" />
    )

    expect(screen.getByRole('button', { name: 'Mark as Found' })).toBeInTheDocument()
  })

  it('shows lost since date when pet is lost', () => {
    render(
      <LostPetToggleButton petId="pet-1" isLost={true} lostSince="2024-06-01T00:00:00Z" />
    )

    expect(screen.getByText(/Lost since:/)).toBeInTheDocument()
  })

  it('does not show lost since when pet is not lost', () => {
    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    expect(screen.queryByText(/Lost since:/)).toBeNull()
  })

  it('button is disabled while isLoading is true', () => {
    mockIsLoading.value = true

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onToggled with the pet on successful toggle', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)
    const onToggled = vi.fn()

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} onToggled={onToggled} />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(onToggled).toHaveBeenCalledWith(mockPet)
    })
  })

  it('shows success toast on successful toggle', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled()
    })
  })

  it('shows error toast when toggle fails', async () => {
    mockToggle.mockResolvedValueOnce(null)

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled()
    })
  })
})
