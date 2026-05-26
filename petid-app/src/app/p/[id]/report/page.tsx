'use client'

import { useRef, useState } from 'react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const { formData, loading, success, error, handleChange, handlePhotoChange, submit } = useReportForm(petId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    handlePhotoChange(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submit()
  }

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

              <div className="space-y-2">
                <Label>{t('photo')}</Label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors overflow-hidden group cursor-pointer relative"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs">{t('photoHint')}</span>
                    </div>
                  )}
                  {photoPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{t('photoChange')}</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
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
