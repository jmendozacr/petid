'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePets } from '@/hooks/usePets'
import { PetCard } from '@/components/pet/PetCard'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const { pets, isLoading, error } = usePets()

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">{t('title')}</h1>
          {!isLoading && !error && pets.length > 0 && (
            <p className="text-muted-foreground mt-1">
              {t('companions', { count: pets.length })}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/dashboard/pets/new">{t('addPet')}</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-warm animate-pulse">
              <div className="aspect-square bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Card className="border-danger bg-danger/10">
          <CardContent className="py-4">
            <p className="text-danger text-center">{error}</p>
          </CardContent>
        </Card>
      ) : pets.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            message={t('emptyMessage')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            action={
              <Button asChild>
                <Link href="/dashboard/pets/new">{t('addFirstPet')}</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}
