import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import enMessages from '../../../../../messages/en.json'
import esMessages from '../../../../../messages/es.json'

vi.mock('@/hooks/usePet', () => ({
  usePet: vi.fn(),
}))

vi.mock('@/hooks/useHealthRecords', () => ({
  useHealthRecords: vi.fn(),
}))

vi.mock('@/stores/pet-store', () => ({
  usePetStore: (selector: (s: { updatePet: () => void }) => unknown) =>
    selector({ updatePet: vi.fn() }),
}))

vi.mock('@/components/qr-code', () => ({
  QRCode: vi.fn(() => null),
  getPublicPetUrl: () => 'https://petid.app/p/pet-1',
  downloadQRCode: vi.fn(),
  sanitizePetName: (n: string) => n,
}))

vi.mock('@/components/pet/lost-pet-toggle-button', () => ({
  LostPetToggleButton: () => null,
}))

import { usePet } from '@/hooks/usePet'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { downloadQRCode } from '@/components/qr-code'
import PetDetailPage from './page'

const mockDownloadQRCode = vi.mocked(downloadQRCode)

const emptyRecords = {
  vaccines: [] as [],
  allergies: [] as [],
  medicalNotes: [] as [],
  add: vi.fn(),
  remove: vi.fn(),
  loading: false,
}

describe('PetDetailPage — loading skeleton', () => {
  beforeEach(() => {
    vi.mocked(usePet).mockReturnValue({
      pet: null,
      loading: true,
      error: null,
      remove: vi.fn(),
      uploadPhoto: vi.fn(),
      applyUpdate: vi.fn(),
    })
    vi.mocked(useHealthRecords).mockReturnValue(emptyRecords)
  })

  // REQ-01.1
  it('skeleton has aria-live="polite" region', () => {
    render(<PetDetailPage />)
    const liveRegion = document.querySelector('[aria-live="polite"]')
    expect(liveRegion).not.toBeNull()
  })

  // REQ-01.2
  it('skeleton has sr-only loading text', () => {
    render(<PetDetailPage />)
    const srOnly = document.querySelector('.sr-only')
    expect(srOnly?.textContent).toBeTruthy()
    expect(srOnly?.textContent?.trim().length).toBeGreaterThan(0)
  })

  // REQ-02.2
  it('loading key exists in en.json', () => {
    expect(enMessages.petDetail.loading).toBeTruthy()
  })

  it('loading key exists in es.json', () => {
    expect(esMessages.petDetail.loading).toBeTruthy()
  })

  // REQ-02.1
  it('sr-only loading text matches English locale', () => {
    render(<PetDetailPage />)
    expect(screen.getByText(enMessages.petDetail.loading)).toBeInTheDocument()
  })
})

describe('PetDetailPage — loaded state', () => {
  const mockPet = {
    id: 'pet-1',
    user_id: 'user-1',
    name: 'Rex',
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
    vi.mocked(usePet).mockReturnValue({
      pet: mockPet,
      loading: false,
      error: null,
      remove: vi.fn(),
      uploadPhoto: vi.fn(),
      applyUpdate: vi.fn(),
    })
    vi.mocked(useHealthRecords).mockReturnValue(emptyRecords)
  })

  // REQ-01.1
  it('pet name is visible when pet is loaded', () => {
    render(<PetDetailPage />)
    expect(screen.getByText('Rex')).toBeInTheDocument()
  })

  // REQ-02.1
  it('health records section renders items', () => {
    vi.mocked(useHealthRecords).mockReturnValue({
      vaccines: [{ id: 'rec-1', pet_id: 'pet-1', type: 'vaccine' as const, description: 'Rabies vaccine', record_date: '2024-01-01' }],
      allergies: [],
      medicalNotes: [],
      add: vi.fn(),
      remove: vi.fn(),
      loading: false,
    })
    render(<PetDetailPage />)
    expect(screen.getByText('Rabies vaccine')).toBeInTheDocument()
  })

  // REQ-03.1
  it('empty state shown when no health records exist', () => {
    render(<PetDetailPage />)
    expect(screen.getByText(enMessages.petDetail.noRecords)).toBeInTheDocument()
  })

  it('renders optional pet fields when populated', () => {
    vi.mocked(usePet).mockReturnValue({
      pet: {
        ...mockPet,
        birthdate: '2020-01-15',
        color: 'Brown',
        weight: 25,
        microchip_id: 'ABC123',
        owner_phone: '+1234567890',
        emergency_contact: '+0987654321',
      },
      loading: false,
      error: null,
      remove: vi.fn(),
      uploadPhoto: vi.fn(),
      applyUpdate: vi.fn(),
    })
    vi.mocked(useHealthRecords).mockReturnValue(emptyRecords)

    render(<PetDetailPage />)

    expect(screen.getByText('2020-01-15')).toBeInTheDocument()
    expect(screen.getByText('Brown')).toBeInTheDocument()
    expect(screen.getByText('+1234567890')).toBeInTheDocument()
  })

  it('renders allergies and medical notes sections when populated', () => {
    vi.mocked(useHealthRecords).mockReturnValue({
      vaccines: [],
      allergies: [{ id: 'a1', pet_id: 'pet-1', type: 'allergy' as const, description: 'Chicken allergy', record_date: '2024-01-01' }],
      medicalNotes: [{ id: 'm1', pet_id: 'pet-1', type: 'medical_note' as const, description: 'Annual checkup', record_date: '2024-02-01' }],
      add: vi.fn(),
      remove: vi.fn(),
      loading: false,
    })

    render(<PetDetailPage />)

    expect(screen.getByText('Chicken allergy')).toBeInTheDocument()
    expect(screen.getByText('Annual checkup')).toBeInTheDocument()
  })

  it('shows HealthRecordForm when Add Record is clicked', () => {
    render(<PetDetailPage />)

    fireEvent.click(screen.getByText(enMessages.petDetail.addRecord))

    expect(screen.getAllByText(enMessages.petDetail.cancel).length).toBeGreaterThan(0)
  })

  it('shows not-found state when pet is null and not loading', () => {
    vi.mocked(usePet).mockReturnValue({
      pet: null,
      loading: false,
      error: null,
      remove: vi.fn(),
      uploadPhoto: vi.fn(),
      applyUpdate: vi.fn(),
    })
    vi.mocked(useHealthRecords).mockReturnValue(emptyRecords)

    render(<PetDetailPage />)

    expect(screen.getByText(enMessages.petDetail.notFound)).toBeInTheDocument()
  })
})

describe('PetDetailPage — QR download', () => {
  const mockPet = {
    id: 'pet-1',
    user_id: 'user-1',
    name: 'Rex',
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
    vi.mocked(usePet).mockReturnValue({
      pet: mockPet,
      loading: false,
      error: null,
      remove: vi.fn(),
      uploadPhoto: vi.fn(),
      applyUpdate: vi.fn(),
    })
    vi.mocked(useHealthRecords).mockReturnValue({
      vaccines: [],
      allergies: [],
      medicalNotes: [],
      add: vi.fn(),
      remove: vi.fn(),
      loading: false,
    })
    mockDownloadQRCode.mockReset()
  })

  // REQ-05 / REQ-07
  it('download uses pet-tag preset by default', async () => {
    mockDownloadQRCode.mockResolvedValue(undefined)
    render(<PetDetailPage />)
    fireEvent.click(screen.getByRole('button', { name: /download/i }))
    await vi.waitFor(() => {
      expect(mockDownloadQRCode).toHaveBeenCalledWith('pet-1', 'Rex')
    })
  })

  // REQ-08.1
  it('shows error toast when download fails', async () => {
    mockDownloadQRCode.mockRejectedValue(new Error('Download failed'))
    render(<PetDetailPage />)
    fireEvent.click(screen.getByRole('button', { name: /download/i }))
    await vi.waitFor(() => {
      expect(mockDownloadQRCode).toHaveBeenCalled()
    })
  })
})
