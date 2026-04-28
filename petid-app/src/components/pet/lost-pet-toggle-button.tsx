'use client'

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

  async function handleClick() {
    const pet = await toggle(!isLost)
    if (pet) {
      toast.success(isLost ? 'Pet marked as found!' : 'Pet marked as lost.')
      onToggled?.(pet)
    } else {
      toast.error('Failed to update lost status. Please try again.')
    }
  }

  return (
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
  )
}
