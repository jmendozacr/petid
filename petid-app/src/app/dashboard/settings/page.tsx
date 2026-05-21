'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'
import { getCurrentPosition } from '@/lib/geolocation'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const { settings, isLoading, isSaving, toggleOptIn, saveAlertLocation } =
    useNotificationSettings()
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  async function handleUseCurrentLocation() {
    setGeoError(null)
    setGeoLoading(true)
    const coords = await getCurrentPosition()
    setGeoLoading(false)

    if (!coords) {
      setGeoError(t('locationDenied'))
      return
    }

    await saveAlertLocation(coords.lat, coords.lng)
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('nearbyAlertsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('nearbyAlertsDescription')}
          </p>
          {isLoading ? (
            <div className="h-8 w-14 rounded-full bg-muted animate-pulse" />
          ) : (
            <button
              role="switch"
              aria-checked={settings?.notify_nearby_lost_pets ?? false}
              disabled={isSaving}
              onClick={toggleOptIn}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                settings?.notify_nearby_lost_pets ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-warm transition-transform duration-200 ${
                  settings?.notify_nearby_lost_pets ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('alertLocationTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('alertLocationDescription')}
          </p>
          <Button
            variant="outline"
            disabled={geoLoading || isSaving}
            onClick={handleUseCurrentLocation}
          >
            {geoLoading || isSaving ? t('savingLocation') : t('useCurrentLocation')}
          </Button>
          {geoError && (
            <p className="text-sm text-danger">{geoError}</p>
          )}
          {settings?.notification_location_updated_at && (
            <p className="text-sm text-muted-foreground">
              {t('lastUpdated', {
                date: new Date(settings.notification_location_updated_at).toLocaleDateString(),
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
