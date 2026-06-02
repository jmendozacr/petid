'use client'

import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePet } from '@/hooks/usePet'
import { usePetForm } from '@/hooks/usePetForm'
import { PetFormFields } from '@/components/pet/PetFormFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function EditPetPage() {
  const t = useTranslations('editPet')
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const { pet, loading: petLoading, error: petError } = usePet(petId)
  const { formData, loading, error, handleChange, submit } = usePetForm(pet ?? undefined)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const updated = await submit()
    if (updated) {
      router.push(`/dashboard/pets/${petId}`)
    }
  }

  if (petLoading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (petError || !pet) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">{petError || t('title')}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <PetFormFields
              formData={formData}
              onChange={handleChange}
              error={error}
            />
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
