import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  created_at: '2024-01-01T00:00:00Z',
}

describe('PetCard', () => {
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
})
