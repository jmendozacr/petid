'use client'

import { useState } from 'react'
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
  const { isLoading, toggle } = useLostPetToggle(petId)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleConfirm() {
    setShowConfirm(false)
    const pet = await toggle(!isLost)
    if (pet) {
      toast.success(isLost ? 'Pet marked as found!' : 'Pet marked as lost.')
      onToggled?.(pet)
    } else {
      toast.error('Failed to update lost status. Please try again.')
    }
  }

  function handleClick() {
    if (!isLost) {
      setShowConfirm(true)
    } else {
      handleConfirm()
    }
  }

  return (
    <>
      <div className="space-y-1">
        <Button
          variant={isLost ? 'success' : 'destructive'}
          disabled={isLoading}
          onClick={handleClick}
        >
          {isLoading ? 'Updating...' : isLost ? 'Mark as Found' : 'Mark as Lost'}
        </Button>
        {isLost && lostSince && (
          <p className="text-sm text-muted-foreground">
            Lost since: {new Date(lostSince).toLocaleDateString()}
          </p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-warm-lg w-full max-w-sm animate-fade-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden="true">🚨</span>
                <h2 className="font-heading text-xl font-semibold text-foreground">Mark as Lost?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will show a <strong className="text-danger">LOST PET</strong> banner on your pet&apos;s public page so anyone who finds them knows to contact you.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Yes, mark as lost'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
