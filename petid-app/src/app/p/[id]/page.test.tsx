import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PublicPetPage from './page'

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return { ...actual, cache: (fn: unknown) => fn }
})

const mockPetSingle = vi.fn()
const mockRecordsOrder = vi.fn()
const mockProfileSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: (table: string) => {
      if (table === 'pets') {
        return { select: () => ({ eq: () => ({ single: mockPetSingle }) }) }
      }
      if (table === 'health_records') {
        return { select: () => ({ eq: () => ({ in: () => ({ order: mockRecordsOrder }) }) }) }
      }
      return { select: () => ({ eq: () => ({ single: mockProfileSingle }) }) }
    },
  })),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockImplementation(async (namespace: string) => {
    return (key: string, params?: { count?: number }) => {
      if (namespace === 'petAge' && params?.count !== undefined) {
        const count = params.count
        if (key === 'years') return count === 1 ? '1 year' : `${count} years`
        if (key === 'months') return count === 1 ? '1 month' : `${count} months`
      }
      return key
    }
  }),
  getLocale: vi.fn().mockResolvedValue('en'),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

const basePet = {
  id: 'pet-1',
  user_id: 'user-1',
  name: 'Buddy',
  species: 'Dog',
  breed: null,
  is_lost: false,
  lost_since: null,
  owner_phone: null,
  emergency_contact: null,
  microchip_id: null,
  photo_url: null,
  color: null,
  weight: null,
}

describe('PublicPetPage — age display', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02'))
    mockRecordsOrder.mockResolvedValue({ data: [] })
    mockProfileSingle.mockResolvedValue({ data: null })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders age in identity section when birthdate is provided', async () => {
    mockPetSingle.mockResolvedValue({ data: { ...basePet, birthdate: '2024-03-01' } })

    const element = await PublicPetPage({ params: Promise.resolve({ id: 'pet-1' }) })
    render(element)

    expect(screen.getByText(/2 years 3 months/i)).toBeInTheDocument()
  })

  it('does not render age when birthdate is null', async () => {
    mockPetSingle.mockResolvedValue({ data: { ...basePet, birthdate: null } })

    const element = await PublicPetPage({ params: Promise.resolve({ id: 'pet-1' }) })
    render(element)

    expect(screen.queryByText(/\d+ year|\d+ month/i)).toBeNull()
  })
})
