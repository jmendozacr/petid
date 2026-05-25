import { useShallow } from 'zustand/react/shallow'
import { usePetStore } from '@/stores/pet-store'
import { getPets } from '@/services/pets-service'

export function usePets() {
  const { pets, isLoading, error, setPets, setLoading, setError } = usePetStore(
    useShallow((s) => ({
      pets: s.pets,
      isLoading: s.isLoading,
      error: s.error,
      setPets: s.setPets,
      setLoading: s.setLoading,
      setError: s.setError,
    }))
  )

  async function loadPets() {
    setLoading(true)
    try {
      const data = await getPets()
      setPets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pets')
    } finally {
      setLoading(false)
    }
  }

  function clearError() {
    setError(null)
  }

  return {
    pets,
    isLoading,
    error,
    loadPets,
    clearError,
  }
}
