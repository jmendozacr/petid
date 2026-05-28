import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Pet } from '@/types/pet'

const mockGetUser = vi.fn()
const mockPetSelectSingle = vi.fn()
const mockUpdateSingle = vi.fn()
const mockFoundReportMaybeSingle = vi.fn()
const mockFetch = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'found_reports') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: mockFoundReportMaybeSingle,
                }),
              }),
            }),
          }),
        }
      }
      return {
        select: () => ({ eq: () => ({ single: mockPetSelectSingle }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: mockUpdateSingle }) }) }),
      }
    },
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.stubGlobal('fetch', mockFetch)

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
  mockFetch.mockResolvedValue({ ok: true } as Response)
  process.env.RESEND_API_KEY = 'test-resend-key'
})

afterEach(() => {
  delete process.env.RESEND_API_KEY
})

describe('toggleLostPetStatus', () => {
  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockUpdateSingle).not.toHaveBeenCalled()
  })

  it('returns error when pet is not found', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'Pet not found' })
    expect(mockUpdateSingle).not.toHaveBeenCalled()
  })

  it('returns error when pet belongs to a different user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-2' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockUpdateSingle).not.toHaveBeenCalled()
  })

  it('returns updated pet on success (mark as lost) and calls revalidatePath', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: mockPet, error: null })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: true, pet: mockPet })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/p/pet-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/pets/pet-1')
    expect(mockFoundReportMaybeSingle).not.toHaveBeenCalled()
  })

  it('does not call revalidatePath on database error', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB failure' } })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result).toEqual({ success: false, error: 'DB failure' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  // REQ-09.1: mark as found — found_report exists → response includes foundReport
  it('returns foundReport when marking as found and a report exists (REQ-09.1)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: { ...mockPet, is_lost: false }, error: null })
    mockFoundReportMaybeSingle.mockResolvedValueOnce({
      data: { contact: 'finder@example.com', message: 'Found near the park' },
      error: null,
    })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', false)

    expect(result.success).toBe(true)
    expect(result.foundReport).toEqual({ contact: 'finder@example.com', message: 'Found near the park' })
  })

  // REQ-09.2: mark as found — no found_report → foundReport is undefined
  it('returns foundReport as undefined when no reports exist (REQ-09.2)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: { ...mockPet, is_lost: false }, error: null })
    mockFoundReportMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', false)

    expect(result.success).toBe(true)
    expect(result.foundReport).toBeUndefined()
  })

  // REQ-09.3: mark as lost → no foundReport queried at all
  it('does not query found_reports when marking as lost (REQ-09.3)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: mockPet, error: null })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', true)

    expect(result.foundReport).toBeUndefined()
    expect(mockFoundReportMaybeSingle).not.toHaveBeenCalled()
  })

  // REQ-06.1: contact contains @ → Resend email attempted
  it('calls Resend API when contact contains @ (REQ-06.1)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: { ...mockPet, is_lost: false }, error: null })
    mockFoundReportMaybeSingle.mockResolvedValueOnce({
      data: { contact: 'finder@example.com', message: null },
      error: null,
    })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    await toggleLostPetStatus('pet-1', false)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' })
    )
  })

  // REQ-07.1: email body includes pet name
  it('includes pet name in notification email subject (REQ-07.1)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: { ...mockPet, is_lost: false }, error: null })
    mockFoundReportMaybeSingle.mockResolvedValueOnce({
      data: { contact: 'finder@example.com', message: null },
      error: null,
    })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    await toggleLostPetStatus('pet-1', false)

    const fetchCall = mockFetch.mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)
    expect(body.subject).toContain('Buddy')
    expect(body.html).toContain('Buddy')
  })

  // REQ-06.2: contact has no @ → Resend not called
  it('does not call Resend when contact has no @ (REQ-06.2)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: { ...mockPet, is_lost: false }, error: null })
    mockFoundReportMaybeSingle.mockResolvedValueOnce({
      data: { contact: '+54 11 5555 1234', message: null },
      error: null,
    })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', false)

    expect(result.success).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // REQ-08.2: Resend failure → action still succeeds
  it('returns success even when Resend call fails (REQ-08.2)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: { ...mockPet, is_lost: false }, error: null })
    mockFoundReportMaybeSingle.mockResolvedValueOnce({
      data: { contact: 'finder@example.com', message: null },
      error: null,
    })
    mockFetch.mockRejectedValueOnce(new Error('Resend network error'))

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    const result = await toggleLostPetStatus('pet-1', false)

    expect(result.success).toBe(true)
  })

  // REQ-05.2: no found_reports → no notification attempt
  it('does not call Resend when no found_reports exist (REQ-05.2)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockPetSelectSingle.mockResolvedValueOnce({ data: { user_id: 'user-1', name: 'Buddy' }, error: null })
    mockUpdateSingle.mockResolvedValueOnce({ data: { ...mockPet, is_lost: false }, error: null })
    mockFoundReportMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const { toggleLostPetStatus } = await import('./toggle-lost-pet-status')
    await toggleLostPetStatus('pet-1', false)

    expect(mockFetch).not.toHaveBeenCalled()
  })
})
