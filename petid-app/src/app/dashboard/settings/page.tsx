'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'
import { ALERT_RADIUS_OPTIONS } from '@/types/profile'
import type { AlertRadius } from '@/types/profile'
import { getCurrentPosition } from '@/lib/geolocation'
import { createClient } from '@/lib/supabase/client'
import { getProfile, updateProfile } from '@/services/profile-service'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const { settings, isLoading, isSaving, toggleOptIn, saveAlertLocation, saveAlertRadius } =
    useNotificationSettings()
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const profile = await getProfile(user.id)
      if (profile) {
        setFullName(profile.full_name ?? '')
        setPhone(profile.phone ?? '')
      }
    })
  }, [])

  async function handleSaveProfile() {
    if (fullName.trim().length < 2) {
      setProfileError(t('profileNameError'))
      return
    }
    setProfileError(null)
    setProfileSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setProfileSaving(false)
      return
    }
    const { error } = await updateProfile(user.id, {
      full_name: fullName.trim(),
      phone: phone.trim() || null,
    })
    setProfileSaving(false)
    if (error) {
      setProfileError(error)
    } else {
      toast.success(t('profileSaved'))
    }
  }

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
          <CardTitle className="text-lg">{t('ownerInfoTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-fullname">{t('ownerFullName')}</Label>
            <Input
              id="settings-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-phone">{t('ownerPhone')}</Label>
            <Input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          {profileError && (
            <p className="text-sm text-danger">{profileError}</p>
          )}
          <Button
            variant="outline"
            disabled={profileSaving}
            onClick={handleSaveProfile}
          >
            {profileSaving ? t('savingProfile') : t('saveProfile')}
          </Button>
        </CardContent>
      </Card>

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
          <CardTitle className="text-lg">{t('alertRadiusTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('alertRadiusDescription')}
          </p>
          {isLoading ? (
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          ) : (
            <Select
              value={String(settings?.alert_radius_km ?? 5)}
              onChange={(e) => saveAlertRadius(Number(e.target.value) as AlertRadius)}
              disabled={isSaving}
              aria-label={t('alertRadiusTitle')}
            >
              {ALERT_RADIUS_OPTIONS.map((km) => (
                <option key={km} value={km}>{t(`alertRadius${km}km`)}</option>
              ))}
            </Select>
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
