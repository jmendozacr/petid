import { createClient } from '@/lib/supabase/client'
import type { NotificationSettings } from '@/types/profile'

export async function getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('notify_nearby_lost_pets, notification_lat, notification_lng, notification_location_updated_at, alert_radius_km')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return data as NotificationSettings
}

export async function updateNotificationSettings(
  userId: string,
  data: Partial<NotificationSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const update: Record<string, unknown> = { ...data }

  if ('notification_lat' in data || 'notification_lng' in data) {
    update.notification_location_updated_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  return { success: true }
}
