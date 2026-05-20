'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/services/notification-settings-service'
import type { NotificationSettings } from '@/types/profile'

interface UseNotificationSettingsReturn {
  settings: NotificationSettings | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  toggleOptIn: () => Promise<void>
  saveAlertLocation: (lat: number, lng: number) => Promise<void>
}

export function useNotificationSettings(): UseNotificationSettingsReturn {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      const data = await getNotificationSettings(user.id)
      if (!cancelled) {
        setSettings(data)
        setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  async function toggleOptIn() {
    if (!settings) return

    const previous = settings.notify_nearby_lost_pets
    const next = !previous

    setSettings(s => s ? { ...s, notify_nearby_lost_pets: next } : s)
    setIsSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSettings(s => s ? { ...s, notify_nearby_lost_pets: previous } : s)
      setIsSaving(false)
      return
    }

    const result = await updateNotificationSettings(user.id, { notify_nearby_lost_pets: next })

    if (!result.success) {
      setSettings(s => s ? { ...s, notify_nearby_lost_pets: previous } : s)
      setError(result.error ?? 'Failed to save')
    }

    setIsSaving(false)
  }

  async function saveAlertLocation(lat: number, lng: number) {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsSaving(false)
      return
    }

    const now = new Date().toISOString()
    const result = await updateNotificationSettings(user.id, {
      notification_lat: lat,
      notification_lng: lng,
    })

    if (result.success) {
      setSettings(s =>
        s ? { ...s, notification_lat: lat, notification_lng: lng, notification_location_updated_at: now } : s
      )
    } else {
      setError(result.error ?? 'Failed to save location')
    }

    setIsSaving(false)
  }

  return { settings, isLoading, isSaving, error, toggleOptIn, saveAlertLocation }
}
