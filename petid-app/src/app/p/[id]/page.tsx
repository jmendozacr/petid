import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { PhotoDisplay } from '@/components/ui/photo-display'
import { QRCode } from '@/components/qr-code'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-2xl border border-border shadow-warm p-5 ${className}`}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  )
}

export default async function PublicPetPage({ params }: PageProps) {
  const { id: petId } = await params
  const [t, locale, supabase] = await Promise.all([
    getTranslations('publicPet'),
    getLocale(),
    createClient(),
  ])

  const [{ data: pet }, { data: records }] = await Promise.all([
    supabase
      .from('pets')
      .select('id, user_id, name, species, breed, birthdate, color, weight, microchip_id, photo_url, owner_phone, emergency_contact, is_lost, lost_since')
      .eq('id', petId)
      .single(),
    supabase
      .from('health_records')
      .select('*')
      .eq('pet_id', petId)
      .in('type', ['allergy', 'medical_note'])
      .order('record_date', { ascending: false }),
  ])

  if (!pet) {
    notFound()
  }

  const allergies = records?.filter(r => r.type === 'allergy') || []
  const medicalNotes = records?.filter(r => r.type === 'medical_note') || []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero photo */}
      <div className="relative h-[45vh] min-h-[260px] bg-muted overflow-hidden">
        <PhotoDisplay photoUrl={pet.photo_url} alt={pet.name} iconClassName="h-28 w-28" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pb-16 -mt-4 relative space-y-4">

        {/* Lost banner */}
        {pet.is_lost && (
          <div className="bg-danger text-danger-foreground rounded-2xl p-5 shadow-warm-md animate-scale-in">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl" role="img" aria-label="Alert">🚨</span>
              <p className="font-heading text-2xl font-bold tracking-tight">{t('lostTitle')}</p>
            </div>
            {pet.lost_since && (
              <p className="text-sm opacity-85 mb-4">
                {t('lostSince', { date: new Date(pet.lost_since).toLocaleDateString(locale, {
                  month: 'long', day: 'numeric', year: 'numeric'
                }) })}
              </p>
            )}
            <a
              href={`/p/${pet.id}/report`}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              📍 {t('reportLink')}
            </a>
          </div>
        )}

        {/* Identity */}
        <div className="pt-2 pb-2 animate-fade-up">
          <h1 className="font-heading text-5xl font-bold text-foreground leading-tight">{pet.name}</h1>
          <p className="text-muted-foreground text-lg mt-1">
            {pet.species}{pet.breed && ` · ${pet.breed}`}
          </p>
        </div>

        {/* Owner contact */}
        {pet.owner_phone && (
          <SectionCard>
            <SectionLabel>{t('ownerContact')}</SectionLabel>
            <a
              href={`tel:${pet.owner_phone}`}
              className="text-xl font-medium text-foreground hover:text-primary transition-colors"
            >
              {pet.owner_phone}
            </a>
          </SectionCard>
        )}

        {/* Emergency contact */}
        {pet.emergency_contact && (
          <SectionCard className="border-danger/30 bg-danger/5">
            <SectionLabel>{t('emergencyContact')}</SectionLabel>
            <a
              href={`tel:${pet.emergency_contact}`}
              className="text-xl font-medium text-danger hover:text-danger/80 transition-colors"
            >
              {pet.emergency_contact}
            </a>
          </SectionCard>
        )}

        {/* Allergies */}
        {allergies.length > 0 && (
          <SectionCard className="border-danger/30">
            <SectionLabel>{t('allergies')}</SectionLabel>
            <div className="space-y-2">
              {allergies.map((allergy) => (
                <div key={allergy.id} className="flex items-start justify-between gap-3 p-3 bg-danger/8 rounded-xl">
                  <p className="font-medium text-foreground">{allergy.description}</p>
                  <time className="text-xs text-muted-foreground shrink-0 mt-0.5">{allergy.record_date}</time>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Medical notes */}
        {medicalNotes.length > 0 && (
          <SectionCard>
            <SectionLabel>{t('medicalNotes')}</SectionLabel>
            <div className="space-y-2">
              {medicalNotes.map((note) => (
                <div key={note.id} className="flex items-start justify-between gap-3 p-3 bg-muted rounded-xl">
                  <p className="font-medium text-foreground">{note.description}</p>
                  <time className="text-xs text-muted-foreground shrink-0 mt-0.5">{note.record_date}</time>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Microchip */}
        {pet.microchip_id && (
          <SectionCard>
            <SectionLabel>{t('microchipId')}</SectionLabel>
            <p className="font-mono text-lg text-foreground tracking-wide">{pet.microchip_id}</p>
          </SectionCard>
        )}

        {/* Report found button */}
        {!pet.is_lost && (
          <Button asChild className="w-full" variant="outline">
            <Link href={`/p/${pet.id}/report`}>
              📍 {t('reportButton')}
            </Link>
          </Button>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          {t('poweredBy')} <span className="font-heading font-semibold text-primary">PetID</span>
        </p>
      </div>
    </div>
  )
}
