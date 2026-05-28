import { useState } from 'react'
import { toggleLostPetStatus } from '@/app/actions/toggle-lost-pet-status'
import { getCurrentPosition } from '@/lib/geolocation'
import type { Pet, FoundReport } from '@/types/pet'

export function useLostPetToggle(petId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGeoLoading, setIsGeoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [foundReport, setFoundReport] = useState<FoundReport | null>(null)

  async function toggle(isLost: boolean): Promise<Pet | null> {
    setError(null)
    setFoundReport(null)
    setIsLoading(true)

    let coords: { lat: number; lng: number } | null = null

    if (isLost) {
      setIsGeoLoading(true)
      coords = await getCurrentPosition()
      setIsGeoLoading(false)
    }
    const result = await toggleLostPetStatus(petId, isLost, coords)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Unknown error')
      return null
    }

    if (!isLost && result.foundReport) {
      setFoundReport(result.foundReport)
    }

    return result.pet ?? null
  }

  function clearError() {
    setError(null)
  }

  return { isLoading, isGeoLoading, error, foundReport, toggle, clearError }
}
