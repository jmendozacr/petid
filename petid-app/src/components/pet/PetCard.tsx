'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PhotoDisplay } from '@/components/ui/photo-display'
import type { Pet } from '@/types/pet'

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const t = useTranslations('petCard')

  return (
    <Link
      href={`/dashboard/pets/${pet.id}`}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <div className="overflow-hidden rounded-xl shadow-warm group-hover:shadow-warm-lg transition-shadow duration-300">
        <div className="aspect-square bg-muted relative overflow-hidden">
          <PhotoDisplay photoUrl={pet.photo_url} alt={pet.name} />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Species badge */}
          {pet.species && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20">
                {pet.species}
              </span>
            </div>
          )}

          {/* "View Details" — hover indicator (also satisfies accessibility) */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-foreground">
              {t('viewDetails')} →
            </span>
          </div>

          {/* Pet info overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0.5 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-heading text-white text-xl font-semibold leading-tight">{pet.name}</h3>
            {pet.breed && (
              <p className="text-white/70 text-sm mt-0.5">{pet.breed}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
