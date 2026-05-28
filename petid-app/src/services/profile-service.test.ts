import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProfile, updateProfile } from './profile-service'
import type { Profile } from '@/types/profile'

const { mockTerminal, mockUpdateEq } = vi.hoisted(() => ({
  mockTerminal: vi.fn(),
  mockUpdateEq: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const c: Record<string, unknown> = {}
    c.select = () => c
    c.eq = () => c
    c.single = mockTerminal
    c.update = () => ({ eq: mockUpdateEq })
    return { from: () => c }
  },
}))

const mockProfile: Profile = {
  id: 'user-1',
  full_name: 'John Doe',
  phone: '+1234567890',
  notify_nearby_lost_pets: false,
  notification_lat: null,
  notification_lng: null,
  notification_location_updated_at: null,
  alert_radius_km: 5,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getProfile', () => {
  it('returns profile on success', async () => {
    mockTerminal.mockResolvedValueOnce({ data: mockProfile, error: null })

    const result = await getProfile('user-1')

    expect(result).toEqual(mockProfile)
  })

  it('returns null on Supabase error', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Row not found' } })

    const result = await getProfile('user-1')

    expect(result).toBeNull()
  })

  it('returns null when data is null', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: null })

    const result = await getProfile('user-1')

    expect(result).toBeNull()
  })
})

describe('updateProfile', () => {
  it('returns { error: null } on success', async () => {
    mockUpdateEq.mockResolvedValueOnce({ error: null })

    const result = await updateProfile('user-1', { full_name: 'Jane Doe', phone: null })

    expect(result).toEqual({ error: null })
  })

  it('returns { error: msg } on failure', async () => {
    mockUpdateEq.mockResolvedValueOnce({ error: { message: 'Update failed' } })

    const result = await updateProfile('user-1', { full_name: 'Jane Doe' })

    expect(result).toEqual({ error: 'Update failed' })
  })
})
