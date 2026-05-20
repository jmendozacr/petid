export interface NotificationSettings {
  notify_nearby_lost_pets: boolean
  notification_lat: number | null
  notification_lng: number | null
  notification_location_updated_at: string | null
}

export interface Profile extends NotificationSettings {
  id: string
}
