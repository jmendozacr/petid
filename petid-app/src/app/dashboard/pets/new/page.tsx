'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePetForm } from '@/hooks/usePetForm'
import { PetFormFields } from '@/components/pet/PetFormFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function NewPetPage() {
  const t = useTranslations('newPet')
  const router = useRouter()
  const { formData, loading, error, handleChange, submit } = usePetForm()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const pet = await submit()
    if (pet) {
      router.push('/dashboard')
    }
  }, [submit, router])

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <PetFormFields formData={formData} onChange={handleChange} error={error} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('submitting') : t('submit')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
