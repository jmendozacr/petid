export const ALERT_RADIUS_OPTIONS = [1, 5, 10] as const
export type AlertRadius = typeof ALERT_RADIUS_OPTIONS[number]

export interface NotificationSettings {
  notify_nearby_lost_pets: boolean
  notification_lat: number | null
  notification_lng: number | null
  notification_location_updated_at: string | null
  alert_radius_km: AlertRadius
}

export interface Profile extends NotificationSettings {
  id: string
  full_name: string | null
  phone: string | null
}
