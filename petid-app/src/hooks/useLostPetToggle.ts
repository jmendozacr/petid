import { useState } from 'react'
import { toggleLostPetStatus } from '@/app/actions/toggle-lost-pet-status'
import type { Pet } from '@/types/pet'

export function useLostPetToggle(petId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle(isLost: boolean): Promise<Pet | null> {
    setIsLoading(true)
    setError(null)

    const result = await toggleLostPetStatus(petId, isLost)

    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Unknown error')
      return null
    }

    return result.pet ?? null
  }

  function clearError() {
    setError(null)
  }

  return { isLoading, error, toggle, clearError }
}
