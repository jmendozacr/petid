'use client'

import { useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useReportForm } from '@/hooks/useReportForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportFoundPetPage() {
  const t = useTranslations('reportFound')
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const { formData, loading, success, error, handleChange, submit } = useReportForm(petId)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }, [submit])

  if (success) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-success">{t('successTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('successDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/p/${petId}`)} className="w-full">
              {t('backToPet')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          {t('back')}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div role="alert" className="text-sm text-danger p-3 rounded-md bg-danger/10">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">{t('message')} *</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder={t('messagePlaceholder')}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('location')}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder={t('locationPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">{t('contact')}</Label>
                <Input
                  id="contact"
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  placeholder={t('contactPlaceholder')}
                />
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('submitting') : t('submit')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
