'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useLostPetToggle } from '@/hooks/useLostPetToggle'
import { cn } from '@/lib/utils'
import type { Pet } from '@/types/pet'

interface LostPetToggleButtonProps {
  petId: string
  isLost: boolean
  lostSince: string | null
  onToggled?: (pet: Pet) => void
}

export function LostPetToggleButton({ petId, isLost, lostSince, onToggled }: LostPetToggleButtonProps) {
  const t = useTranslations('petDetail')
  const { isLoading, isGeoLoading, foundReport, toggle } = useLostPetToggle(petId)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showRecoverySuccess, setShowRecoverySuccess] = useState(false)

  async function handleConfirm() {
    const pet = await toggle(!isLost)
    setShowConfirm(false)
    if (pet) {
      if (isLost) {
        setShowRecoverySuccess(true)
      } else {
        toast.success(t('toastMarkedLost'))
      }
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
      <div className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
        isLost ? "border-danger/40 bg-danger/5" : "border-border bg-card"
      )}>
        <div className="flex items-center gap-3">
          <span className={cn(
            "h-2.5 w-2.5 rounded-full flex-shrink-0",
            isLost ? "bg-danger animate-pulse" : "bg-success"
          )} />
          <div>
            <p className="text-sm font-medium text-foreground">
              {isLost ? t('statusLost') : t('statusHome')}
            </p>
            {isLost && lostSince && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('lostSince', { date: new Date(lostSince).toLocaleDateString() })}
              </p>
            )}
          </div>
        </div>
        <Button
          variant={isLost ? 'success' : 'destructive'}
          size="sm"
          disabled={isLoading || isGeoLoading}
          onClick={handleClick}
        >
          {isLoading ? t('updating') : isLost ? t('markAsFound') : t('markAsLost')}
        </Button>
      </div>

      {/* Confirm modal */}
      <Dialog.Root
        open={showConfirm}
        onOpenChange={(open) => { if (!open && !isLoading && !isGeoLoading) setShowConfirm(false) }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content
            aria-modal="true"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
            onEscapeKeyDown={(e) => { if (isLoading || isGeoLoading) e.preventDefault() }}
            onPointerDownOutside={(e) => { if (isLoading || isGeoLoading) e.preventDefault() }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-warm-lg">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl" aria-hidden="true">{isLost ? '🏠' : '🚨'}</span>
                  <Dialog.Title className="font-heading text-xl font-semibold text-foreground">
                    {isLost ? t('confirmFoundTitle') : t('confirmLostTitle')}
                  </Dialog.Title>
                </div>
                <Dialog.Description className="text-sm text-muted-foreground leading-relaxed">
                  {isLost ? t('confirmFoundDescription') : t('confirmLostDescription')}
                </Dialog.Description>
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Recovery success modal */}
      <Dialog.Root
        open={showRecoverySuccess}
        onOpenChange={(open) => { if (!open) setShowRecoverySuccess(false) }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content
            aria-modal="true"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-card rounded-2xl border border-border shadow-warm-lg">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl" aria-hidden="true">🎉</span>
                  <Dialog.Title className="font-heading text-xl font-semibold text-foreground">
                    {t('recoverySuccessTitle')}
                  </Dialog.Title>
                </div>
                <Dialog.Description className="text-sm text-muted-foreground leading-relaxed">
                  {t('recoverySuccessMessage')}
                </Dialog.Description>
                {foundReport ? (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t('recoveryReporterLabel')}</p>
                    <p className="text-sm font-medium text-foreground">{foundReport.contact}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-3">{t('recoveryNoReporter')}</p>
                )}
              </div>
              <div className="px-6 pb-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRecoverySuccess(false)}
                >
                  {t('recoveryDismiss')}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
