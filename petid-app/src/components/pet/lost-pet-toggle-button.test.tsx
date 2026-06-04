import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { LostPetToggleButton } from './lost-pet-toggle-button'
import type { Pet, FoundReport } from '@/types/pet'

const { mockToggle, mockIsLoading, mockIsGeoLoading, mockFoundReport, mockToast } = vi.hoisted(() => ({
  mockToggle: vi.fn(),
  mockIsLoading: { value: false },
  mockIsGeoLoading: { value: false },
  mockFoundReport: { value: null as FoundReport | null },
  mockToast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/hooks/useLostPetToggle', () => ({
  useLostPetToggle: () => ({
    isLoading: mockIsLoading.value,
    isGeoLoading: mockIsGeoLoading.value,
    toggle: mockToggle,
    error: null,
    foundReport: mockFoundReport.value,
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
  lost_lat: null,
  lost_lng: null,
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockIsLoading.value = false
  mockIsGeoLoading.value = false
  mockFoundReport.value = null
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

    expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled()
  })

  it('opens confirmation modal when Mark as Lost is clicked', () => {
    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))

    expect(screen.getByRole('heading', { name: /mark as lost/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, mark as lost/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('opens confirmation modal when Mark as Found is clicked', () => {
    render(
      <LostPetToggleButton petId="pet-1" isLost={true} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Found' }))

    expect(screen.getByRole('heading', { name: /mark as found/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, mark as found/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('closes modal without toggling when Cancel is clicked', () => {
    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByRole('heading', { name: /mark as lost/i })).toBeNull()
    expect(mockToggle).not.toHaveBeenCalled()
  })

  it('calls onToggled with the pet on successful toggle', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)
    const onToggled = vi.fn()

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} onToggled={onToggled} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as lost/i }))

    await waitFor(() => {
      expect(onToggled).toHaveBeenCalledWith(mockPet)
    })
  })

  it('shows success toast when marking as lost', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as lost/i }))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled()
    })
  })

  it('shows error toast when toggle fails', async () => {
    mockToggle.mockResolvedValueOnce(null)

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as lost/i }))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled()
    })
  })

  // REQ-01.1: recovery screen appears after successful mark-as-found
  it('shows recovery screen after successful mark-as-found (REQ-01.1)', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)

    render(
      <LostPetToggleButton petId="pet-1" isLost={true} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Found' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as found/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your pet is home/i })).toBeInTheDocument()
    })
  })

  // REQ-01.2: recovery screen does NOT appear after mark-as-lost
  it('does not show recovery screen after mark-as-lost (REQ-01.2)', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)

    render(
      <LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as lost/i }))

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled()
    })

    expect(screen.queryByRole('heading', { name: /your pet is home/i })).toBeNull()
  })

  // REQ-02.1: dismiss button closes recovery screen
  it('dismiss button closes recovery screen (REQ-02.1)', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)

    render(
      <LostPetToggleButton petId="pet-1" isLost={true} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Found' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as found/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your pet is home/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /done/i }))

    expect(screen.queryByRole('heading', { name: /your pet is home/i })).toBeNull()
  })

  // REQ-03.1: reporter contact visible when foundReport is present
  it('shows reporter contact when foundReport is present (REQ-03.1)', async () => {
    mockFoundReport.value = { contact: 'finder@example.com', message: 'Found near the park' }
    mockToggle.mockResolvedValueOnce(mockPet)

    render(
      <LostPetToggleButton petId="pet-1" isLost={true} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Found' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as found/i }))

    await waitFor(() => {
      expect(screen.getByText('finder@example.com')).toBeInTheDocument()
    })
  })

  // REQ-05.1: confirm modal has aria attributes
  it('confirm modal has aria-modal, aria-labelledby, aria-describedby (REQ-05.1)', () => {
    render(<LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(dialog).toHaveAttribute('aria-describedby')
  })

  // REQ-06.1 + REQ-06.2: Radix Dialog manages scroll lock via react-remove-scroll.
  // jsdom does not implement native scroll so we verify open/close state instead.
  it('dialog opens and closes correctly — scroll lock managed by Radix (REQ-06.1, REQ-06.2)', () => {
    render(<LostPetToggleButton petId="pet-1" isLost={false} lostSince={null} />)

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Lost' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  // REQ-07.1: 🎉 emoji has aria-hidden in recovery modal
  it('🎉 emoji has aria-hidden="true" in recovery modal (REQ-07.1)', async () => {
    mockToggle.mockResolvedValueOnce(mockPet)
    render(<LostPetToggleButton petId="pet-1" isLost={true} lostSince={null} />)

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Found' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as found/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    const emojiSpans = dialog.querySelectorAll('span[aria-hidden="true"]')
    const hasPartyEmoji = Array.from(emojiSpans).some(s => s.textContent?.includes('🎉'))
    expect(hasPartyEmoji).toBe(true)
  })

  // REQ-03.2: no contact section when no foundReport
  it('shows no-reporter fallback when foundReport is null (REQ-03.2)', async () => {
    mockFoundReport.value = null
    mockToggle.mockResolvedValueOnce(mockPet)

    render(
      <LostPetToggleButton petId="pet-1" isLost={true} lostSince={null} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mark as Found' }))
    fireEvent.click(screen.getByRole('button', { name: /yes, mark as found/i }))

    await waitFor(() => {
      expect(screen.getByText(/no reports were submitted/i)).toBeInTheDocument()
    })
  })
})
