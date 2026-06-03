import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render as renderRTL } from '@testing-library/react'
import { render, screen } from '@/test/test-utils'
import { NextIntlClientProvider } from 'next-intl'
import esMessages from '../../../messages/es.json'
import { PetCard } from './PetCard'
import type { Pet } from '@/types/pet'

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
  is_lost: false,
  lost_since: null,
  lost_lat: null,
  lost_lng: null,
  created_at: '2024-01-01T00:00:00Z',
}

describe('PetCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders pet name', () => {
    render(<PetCard pet={mockPet} />)

    expect(screen.getByText('Buddy')).toBeInTheDocument()
  })

  it('renders species and breed', () => {
    render(<PetCard pet={mockPet} />)

    expect(screen.getByText(/Dog/)).toBeInTheDocument()
    expect(screen.getByText(/Golden Retriever/)).toBeInTheDocument()
  })

  it('renders placeholder SVG when no photo', () => {
    render(<PetCard pet={mockPet} />)

    expect(screen.queryByRole('img')).toBeNull()
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders photo when photo_url is provided', () => {
    const petWithPhoto = { ...mockPet, photo_url: 'https://example.com/buddy.jpg' }
    render(<PetCard pet={petWithPhoto} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/buddy.jpg')
    expect(img).toHaveAttribute('alt', 'Buddy')
  })

  it('renders View Details link pointing to pet page', () => {
    render(<PetCard pet={mockPet} />)

    const link = screen.getByRole('link', { name: /view details/i })
    expect(link).toHaveAttribute('href', '/dashboard/pets/pet-1')
  })

  it('renders age in overlay when birthdate is provided', () => {
    const petWithBirthdate = { ...mockPet, birthdate: '2024-03-01' }
    render(<PetCard pet={petWithBirthdate} />)

    expect(screen.getByText(/2 years 3 months/i)).toBeInTheDocument()
  })

  it('does not render age when birthdate is null', () => {
    render(<PetCard pet={mockPet} />)

    expect(screen.queryByText(/\d+ year|\d+ month/i)).toBeNull()
  })

  it('renders "1 year" in EN locale (singular)', () => {
    const pet = { ...mockPet, birthdate: '2025-06-02' }
    render(<PetCard pet={pet} />)

    expect(screen.getByText(/\b1 year\b/)).toBeInTheDocument()
  })

  it('renders "2 years" in EN locale (plural)', () => {
    const pet = { ...mockPet, birthdate: '2024-06-02' }
    render(<PetCard pet={pet} />)

    expect(screen.getByText(/\b2 years\b/)).toBeInTheDocument()
  })

  it('renders "1 mes" in ES locale (singular month)', () => {
    const pet = { ...mockPet, birthdate: '2026-05-02' }
    const { getByText } = renderRTL(
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <PetCard pet={pet} />
      </NextIntlClientProvider>
    )

    expect(getByText(/\b1 mes\b/)).toBeInTheDocument()
  })

  it('renders "5 meses" in ES locale (plural months)', () => {
    const pet = { ...mockPet, birthdate: '2026-01-02' }
    const { getByText } = renderRTL(
      <NextIntlClientProvider locale="es" messages={esMessages}>
        <PetCard pet={pet} />
      </NextIntlClientProvider>
    )

    expect(getByText(/\b5 meses\b/)).toBeInTheDocument()
  })
})
