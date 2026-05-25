import { useEffect } from 'react'
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

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPets()
      .then((data) => { if (!cancelled) setPets(data) })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load pets') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function clearError() {
    setError(null)
  }

  return {
    pets,
    isLoading,
    error,
    clearError,
  }
}
