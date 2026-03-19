import { useCallback } from 'react'
import { usePetStore } from '@/stores/pet-store'
import { getPets } from '@/services/pets-service'

export function usePets() {
  const pets = usePetStore((state) => state.pets)
  const isLoading = usePetStore((state) => state.isLoading)
  const error = usePetStore((state) => state.error)
  const setPets = usePetStore((state) => state.setPets)
  const setLoading = usePetStore((state) => state.setLoading)
  const setError = usePetStore((state) => state.setError)

  const loadPets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPets()
      setPets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pets')
    } finally {
      setLoading(false)
    }
  }, [setPets, setLoading, setError])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  return {
    pets,
    isLoading,
    error,
    loadPets,
    clearError,
  }
}
