import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import enMessages from '../../../../../messages/en.json'
import esMessages from '../../../../../messages/es.json'

vi.mock('@/hooks/usePet', () => ({
  usePet: () => ({
    pet: null,
    loading: true,
    error: null,
    remove: vi.fn(),
    uploadPhoto: vi.fn(),
    applyUpdate: vi.fn(),
  }),
}))

vi.mock('@/hooks/useHealthRecords', () => ({
  useHealthRecords: () => ({
    vaccines: [],
    allergies: [],
    medicalNotes: [],
    add: vi.fn(),
    remove: vi.fn(),
    loading: false,
  }),
}))

vi.mock('@/stores/pet-store', () => ({
  usePetStore: (selector: (s: { updatePet: () => void }) => unknown) =>
    selector({ updatePet: vi.fn() }),
}))

vi.mock('@/components/qr-code', () => ({
  QRCode: () => null,
  getPublicPetUrl: () => 'https://petid.app/p/pet-1',
  downloadQRCode: vi.fn(),
  sanitizePetName: (n: string) => n,
}))

import PetDetailPage from './page'

describe('PetDetailPage — loading skeleton', () => {
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
