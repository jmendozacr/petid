import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotificationSettings } from './useNotificationSettings'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/services/notification-settings-service'
import type { AlertRadius } from '@/types/profile'

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('@/services/notification-settings-service')

const mockSettings = {
  notify_nearby_lost_pets: true,
  notification_lat: null,
  notification_lng: null,
  notification_location_updated_at: null,
  alert_radius_km: 5 as AlertRadius,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  vi.mocked(getNotificationSettings).mockResolvedValue(mockSettings)
  vi.mocked(updateNotificationSettings).mockResolvedValue({ success: true })
})

describe('useNotificationSettings', () => {
  // REQ-01.1: default radius is 5
  it('exposes alert_radius_km = 5 by default', async () => {
    const { result } = renderHook(() => useNotificationSettings())

    await act(async () => {})

    expect(result.current.settings?.alert_radius_km).toBe(5)
    expect(result.current.isLoading).toBe(false)
  })

  // REQ-02.3: pre-selection — hook reflects loaded value
  it('reflects alert_radius_km = 1 when loaded from service', async () => {
    vi.mocked(getNotificationSettings).mockResolvedValueOnce({
      ...mockSettings,
      alert_radius_km: 1 as AlertRadius,
    })

    const { result } = renderHook(() => useNotificationSettings())

    await act(async () => {})

    expect(result.current.settings?.alert_radius_km).toBe(1)
  })

  // REQ-02.1: saveAlertRadius(1) persists via service
  it('saveAlertRadius(1) calls updateNotificationSettings with alert_radius_km: 1', async () => {
    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    await act(async () => {
      await result.current.saveAlertRadius(1)
    })

    expect(vi.mocked(updateNotificationSettings)).toHaveBeenCalledWith('user-1', {
      alert_radius_km: 1,
    })
    expect(result.current.settings?.alert_radius_km).toBe(1)
  })

  // REQ-02.2: saveAlertRadius(10) persists via service
  it('saveAlertRadius(10) calls updateNotificationSettings with alert_radius_km: 10', async () => {
    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    await act(async () => {
      await result.current.saveAlertRadius(10)
    })

    expect(vi.mocked(updateNotificationSettings)).toHaveBeenCalledWith('user-1', {
      alert_radius_km: 10,
    })
    expect(result.current.settings?.alert_radius_km).toBe(10)
  })

  // REQ-02.1 (error path, S-002): DB error reverts optimistic state
  it('reverts alert_radius_km and sets error on DB failure', async () => {
    vi.mocked(updateNotificationSettings).mockResolvedValueOnce({
      success: false,
      error: 'DB error',
    })

    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    await act(async () => {
      await result.current.saveAlertRadius(1)
    })

    expect(result.current.settings?.alert_radius_km).toBe(5)
    expect(result.current.error).toBe('DB error')
  })

  // REQ-02.1 (isSaving): isSaving is true during call, false after
  it('sets isSaving true during saveAlertRadius and false after success', async () => {
    let resolve!: (v: { success: boolean }) => void
    vi.mocked(updateNotificationSettings).mockReturnValueOnce(
      new Promise((res) => { resolve = res })
    )

    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    act(() => { result.current.saveAlertRadius(10) })
    expect(result.current.isSaving).toBe(true)

    await act(async () => { resolve({ success: true }) })
    expect(result.current.isSaving).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('toggleOptIn flips notify_nearby_lost_pets and persists (toggleOptIn happy path)', async () => {
    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    await act(async () => { await result.current.toggleOptIn() })

    expect(vi.mocked(updateNotificationSettings)).toHaveBeenCalledWith('user-1', {
      notify_nearby_lost_pets: false,
    })
    expect(result.current.settings?.notify_nearby_lost_pets).toBe(false)
  })

  it('toggleOptIn reverts and sets error on DB failure (toggleOptIn error path)', async () => {
    vi.mocked(updateNotificationSettings).mockResolvedValueOnce({
      success: false,
      error: 'Toggle failed',
    })

    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    await act(async () => { await result.current.toggleOptIn() })

    expect(result.current.settings?.notify_nearby_lost_pets).toBe(true)
    expect(result.current.error).toBe('Toggle failed')
  })

  it('saveAlertLocation persists lat/lng and updates state (saveAlertLocation happy path)', async () => {
    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    await act(async () => { await result.current.saveAlertLocation(10.5, -74.0) })

    expect(vi.mocked(updateNotificationSettings)).toHaveBeenCalledWith('user-1', {
      notification_lat: 10.5,
      notification_lng: -74.0,
    })
    expect(result.current.settings?.notification_lat).toBe(10.5)
  })

  it('saveAlertLocation sets error on DB failure (saveAlertLocation error path)', async () => {
    vi.mocked(updateNotificationSettings).mockResolvedValueOnce({
      success: false,
      error: 'Location save failed',
    })

    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    await act(async () => { await result.current.saveAlertLocation(10.5, -74.0) })

    expect(result.current.error).toBe('Location save failed')
    expect(result.current.settings?.notification_lat).toBeNull()
  })

  it('toggleOptIn returns early when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await act(async () => { await result.current.toggleOptIn() })

    expect(vi.mocked(updateNotificationSettings)).not.toHaveBeenCalled()
  })

  it('saveAlertLocation returns early when user is not authenticated', async () => {
    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await act(async () => { await result.current.saveAlertLocation(10.5, -74.0) })

    expect(vi.mocked(updateNotificationSettings)).not.toHaveBeenCalled()
    expect(result.current.isSaving).toBe(false)
  })

  it('saveAlertRadius returns early when user is not authenticated', async () => {
    const { result } = renderHook(() => useNotificationSettings())
    await act(async () => {})

    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await act(async () => { await result.current.saveAlertRadius(10) })

    expect(vi.mocked(updateNotificationSettings)).not.toHaveBeenCalled()
    expect(result.current.settings?.alert_radius_km).toBe(5)
  })
})
