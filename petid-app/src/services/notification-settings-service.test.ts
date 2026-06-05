import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getNotificationSettings, updateNotificationSettings } from './notification-settings-service'

const { mockSingle, mockUpdateEq, mockUpdateCapture } = vi.hoisted(() => ({
  mockSingle: vi.fn(),
  mockUpdateEq: vi.fn(),
  mockUpdateCapture: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: mockSingle }) }),
      update: (payload: unknown) => {
        mockUpdateCapture(payload)
        return { eq: mockUpdateEq }
      },
    }),
  }),
}))

const mockSettings = {
  notify_nearby_lost_pets: true,
  notification_lat: null,
  notification_lng: null,
  notification_location_updated_at: null,
  alert_radius_km: 5,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUpdateEq.mockResolvedValue({ error: null })
})

describe('getNotificationSettings', () => {
  it('returns settings for existing user (REQ-01.1)', async () => {
    mockSingle.mockResolvedValue({ data: mockSettings, error: null })

    const result = await getNotificationSettings('user-1')

    expect(result).toEqual(mockSettings)
  })

  it('returns null on database error (REQ-02.1)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const result = await getNotificationSettings('user-1')

    expect(result).toBeNull()
  })

  it('returns null when no profile found (REQ-02.2)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null })

    const result = await getNotificationSettings('user-1')

    expect(result).toBeNull()
  })
})

describe('updateNotificationSettings', () => {
  it('returns { success: true } on successful update (REQ-03.1)', async () => {
    const result = await updateNotificationSettings('user-1', { alert_radius_km: 10 })

    expect(result).toEqual({ success: true })
  })

  it('returns { success: false, error } on DB failure (REQ-03.2)', async () => {
    mockUpdateEq.mockResolvedValue({ error: { message: 'Connection timeout' } })

    const result = await updateNotificationSettings('user-1', { alert_radius_km: 10 })

    expect(result).toEqual({ success: false, error: 'Connection timeout' })
  })

  it('includes notification_location_updated_at when lat/lng provided (REQ-04.1)', async () => {
    await updateNotificationSettings('user-1', {
      notification_lat: 10.5,
      notification_lng: -74.0,
    })

    const payload = mockUpdateCapture.mock.calls[0][0] as Record<string, unknown>
    expect(payload).toHaveProperty('notification_location_updated_at')
    expect(typeof payload.notification_location_updated_at).toBe('string')
  })

  it('does NOT include notification_location_updated_at when lat/lng absent', async () => {
    await updateNotificationSettings('user-1', { alert_radius_km: 5 })

    const payload = mockUpdateCapture.mock.calls[0][0] as Record<string, unknown>
    expect(payload).not.toHaveProperty('notification_location_updated_at')
  })
})
