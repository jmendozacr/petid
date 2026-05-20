'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useLostPetToggle } from '@/hooks/useLostPetToggle'
import type { Pet } from '@/types/pet'

interface LostPetToggleButtonProps {
  petId: string
  isLost: boolean
  lostSince: string | null
  onToggled?: (pet: Pet) => void
}

export function LostPetToggleButton({ petId, isLost, lostSince, onToggled }: LostPetToggleButtonProps) {
  const t = useTranslations('petDetail')
  const { isLoading, isGeoLoading, toggle } = useLostPetToggle(petId)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleConfirm() {
    const pet = await toggle(!isLost)
    setShowConfirm(false)
    if (pet) {
      toast.success(isLost ? t('toastMarkedFound') : t('toastMarkedLost'))
      onToggled?.(pet)
    } else {
      toast.error(t('toastToggleError'))
    }
  }

  function handleClick() {
    setShowConfirm(true)
  }

  return (
    <>
      <div className="space-y-1">
        <Button
          variant={isLost ? 'success' : 'destructive'}
          disabled={isLoading || isGeoLoading}
          onClick={handleClick}
        >
          {isLoading ? t('updating') : isLost ? t('markAsFound') : t('markAsLost')}
        </Button>
        {isLost && lostSince && (
          <p className="text-sm text-muted-foreground">
            {t('lostSince', { date: new Date(lostSince).toLocaleDateString() })}
          </p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-warm-lg w-full max-w-sm animate-fade-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden="true">{isLost ? '🏠' : '🚨'}</span>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {isLost ? t('confirmFoundTitle') : t('confirmLostTitle')}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isLost ? t('confirmFoundDescription') : t('confirmLostDescription')}
              </p>
              {!isLost && (
                <p className="text-sm text-muted-foreground mt-2">
                  We&apos;ll use your location to alert nearby users. Location access is optional.
                </p>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                variant={isLost ? 'success' : 'destructive'}
                className="flex-1"
                onClick={handleConfirm}
                disabled={isLoading || isGeoLoading}
              >
                {isGeoLoading && !isLost
                  ? 'Getting location...'
                  : isLoading
                  ? t('updating')
                  : isLost
                  ? t('confirmFoundAction')
                  : t('confirmLostAction')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
